/* global localStorage */
/* global $, libsb, location, window, timeoutMapping */
var ArrayCache = require('./ArrayCache.js');
var generate = require('../lib/generate');
var cache = {}, core;
var LRU = {};
var messageListener = false;
var domain = location.host;
var path = location.pathname;
var config = require('../client-config.js');

window.timeoutMapping = {};

(function clearLS(){
	var version = 'version' + config.localStorage.version;
	if(!localStorage.hasOwnProperty(version)){
		console.log("Old version of LocalStorage present, clearing ...");
		localStorage.clear();
		localStorage[version] = true;
	}else{
		console.log("LocalStorage version is current ...");
	}
})();

function loadArrayCache(key){
	// loads an ArrayCache from LocalStorage.
	var texts;
	console.log("---- loading arrayCache for ", key);
	if(localStorage.hasOwnProperty(key)){
		try{
			texts = JSON.parse(localStorage[key]);
		}catch(e){
			texts = [];
		}
		return (new ArrayCache(texts));
	} else {
		return (new ArrayCache([]));
	}
}

function saveCache(key){
	// saves an ArrayCache to LocalStorage
	try{
		localStorage[key] = JSON.stringify(cache[key].d);
	} catch(e){
		if(e.name == 'QuotaExceededError' || e.code == 22){ // localStorage is full!
			deleteLRU();
			saveCache(key);
		}
	}
	LRU[key] = new Date().getTime();
	save();
}

function generateLSKey(){
	var args = Array.prototype.slice.call(arguments, 0); 
    if(!args){ return; }
	var argumentsLC = args.map(function(val){
		return val.toLowerCase();
	});
	return argumentsLC.join('_');
}

function deleteLRU(){
    // deletes the least recently used entry from LocalStorage
    var leastTime = Infinity, leastEntry;
    for(var i in LRU) {
        if(LRU[i] < leastTime){
            leastTime = LRU[i];
            leastEntry = i;
        }
    }
    if(leastTime != Infinity){
        delete LRU[leastEntry];
        delete localStorage[leastEntry];
    }
}

function save(){
	//saves user, session, LRU, rooms, occupantOf, memberOf to LocalStorage
	localStorage.user = JSON.stringify(cache.user);
	localStorage.session = cache.session;
	localStorage.LRU = JSON.stringify(LRU);
	localStorage.occupantOf = JSON.stringify(cache.occupantOf);
	localStorage.memberOf = JSON.stringify(cache.memberOf);
}


try{
	cache.user = JSON.parse(localStorage.user);
	cache.session = localStorage.session;
	LRU = JSON.parse(localStorage.LRU);
	cache.occupantOf = JSON.parse(localStorage.occupantOf);
	cache.memberOf = JSON.parse(localStorage.memberOf);
}catch(e){
	// do nothing, e is thrown when values do not exist in localStorage,
	// which is a valid scenario, execution must continue.
}


libsb.on('back-dn', function(back, next) {
	console.log("Back dn 1");
	// loading ArrayCache from LocalStorage when user has navigated to the room.
	var key = generateLSKey(back.to, 'texts');
	cache[key] = loadArrayCache(key);
	var items = cache[key].d;
	var lastMsg = items[items.length -1];
	if(lastMsg && lastMsg.type !== "result-end"){
		cache[key].d.push({type: 'result-end', endtype: 'time', time: lastMsg.time });
	}
	saveCache(key);
	next();
}, 1000);

module.exports = function(c){
	core = c;
	
	core.on('back-dn', function(back, next){
		// store a result-start in ArrayCache, to indicate the beginning of the current stream of messages from the user
		console.log("Back dn 2");
		var msg = {type: 'result-start', endtype: 'time', time: back.time};
		var key = generateLSKey(back.to, 'texts');
		if(cache && cache.hasOwnProperty(key)){
			cache[key].d.push(msg);
		}
		console.log(cache[key].d);
		saveCache(key);
		next();
	}, 500);
	
	core.on('getTexts', function(query, next){
		// getTextsBefore
        if(query.thread){
			// creating individual cahce entries
			return next();
		}
		var key = generateLSKey(query.to, 'texts');
		if(!cache.hasOwnProperty(key)){
			cache[key] = loadArrayCache(key);
		}
		
        if(!cache[key].d.length) { console.log('c[k].l', cache[key].d.length); return next(); }
        
		var results = cache[key].get(query);
		
		if(!results || !results.length) {
			return next();
		} else {
			query.results = results;
            query.resultSource = 'localStorage';
            return next();
		}
	}, 200); // runs before the socket

	core.on('getTexts', function(query, next){
        if(query.resultSource == 'localStorage') { console.log("own results; skipping push"); return next(); }
		var results = query.results.slice(0); // copying by value
		if(results && results.length > 0){
			// merging results into the Cache.
			if(query.before){
                if(results.length === query.before){
                    results.unshift({type: 'result-start', time: results[0].time, endtype: 'limit'});
                }
				results.push({type: 'result-end', endtype: 'time', time:query.time});
			} else if(query.after){
                if(results.length === query.after){
                    results.push({type: 'result-end', time: results[results.length - 1].time, endtype: 'limit'});
                }
				results.unshift({type: 'result-start', endtype: 'time', time: query.time});
			}
			var lskey = generateLSKey(query.to, 'texts');
			if(!cache.hasOwnProperty(lskey)){ loadArrayCache(lskey); }
			cache[lskey].put(results);
			saveCache(lskey);
		}
		next();
	}, 8); // runs after the socket
	
	core.on('getThreads', function(query, next){
		var key = generateLSKey(query.to, 'threads');
		if(!cache.hasOwnProperty(key)){
			cache[key] = loadArrayCache(key);
		}

		if(!cache[key].d.length) { console.log('c[k].l', cache[key].d.length); return next(); }

		var results = cache[key].get(query);

		if(!results || !results.length){
			return next();
		}else{
			query.results = results;
			query.resultSource = 'localStorage';
			return next();
		}
	}, 200); // runs before the socket

	core.on('getThreads', function(query, next){
		if(query.resultSource === 'localStorage') { return next(); }
		var results = query.results.slice(0); // copy by value
		if(results && results.length > 0){
			// merge results to cache
			if(query.before){
				if(results.length === query.before){
					results.unshift({type: 'result-start', time: results[0].time, endtype: 'limit'});
				}
				results.push({type: 'result-end', endtype: 'time', time: query.time});
			} else if(query.after){
				if(results.length === query.after){
					results.push({type: 'result-end', time: results[results.length -1].time, endtype: 'limit'});
				}
				results.unshift({type: 'result-start', endtype: 'time', time: query.time});
			}
			var lskey = generateLSKey(query.to, 'threads');
			if(!cache.hasOwnProperty(lskey)){ loadArrayCache(lskey); }
			cache[lskey].put(results);
			saveCache(lskey);
		}
		next();
	}, 8); // runs after socket

	core.on('getRooms', function(query, next){
	
		// only getRooms with ref are cached as of now.

		if(!query.ref){
			return next();
		}

		var rooms = {};
		
		rooms = cache.rooms || {};
		
		if(rooms.hasOwnProperty(query.ref)){
			query.results = [rooms[query.ref]];
		}

		next();
	
	}, 400); // run before socket

	function delRoomTimeOut(roomId){
		/*
		this function deletes a saved room object from the cache every 'n' mintues
		*/
		var minutes = 10; // 10 minutes timeout
		
		clearTimeout(timeoutMapping[roomId]);
		
		timeoutMapping[roomId] = setTimeout(function(){
			if(cache && cache.rooms){ delete cache.rooms[roomId]; }
		}, minutes*60*1000);
	}

	core.on('getRooms', function(query, next){

		if(!query.ref){
			return next();
		}

		var rooms = {};

		rooms = cache.rooms? cache.rooms : {};
		
		if(query.results){
			query.results.forEach(function(room){
				rooms[room.id] = room;
				delRoomTimeOut(room.id);
			});
		}

		cache.rooms = rooms;
		next();

	}, 8); // run after socket
	
	core.on('text-dn', function(text, next){
		var texts = [text];
		var key = generateLSKey(text.to, 'texts');
		if(cache && cache[key]){ cache[key].put(texts); }
		saveCache(key);
		next();
	}, 500); // storing new texts to cache.
	
	core.on('room-dn', function(room, next){
		var roomObj = room.room;
		if(cache){
			cache.rooms = cache.rooms ? cache.rooms : {};
			cache.rooms[roomObj.id] = roomObj;
			delRoomTimeOut(roomObj.id);
		}
		next();
	}, 500);
	
	core.on('init-dn', function(init, next){
		cache.user = init.user;
		cache.occupantOf = init.occupantOf;
		cache.memberOf = init.memberOf;
		
		// caching occupantOf and memberOf to cache.rooms
		
		cache.rooms = cache.rooms ? cache.rooms : {};
		
        init.occupantOf.forEach(function(room){
			cache.rooms[room.id] = room;
			delRoomTimeOut(room.id);
		});
		
		init.memberOf.forEach(function(room){
			cache.rooms[room.id] = room;
			delRoomTimeOut(room.id);
		});
		
		
		save();
		next();
	}, 500);
	
	core.on('connected', function(d,n){
		var sid;
		if(!cache){ cache = {}; }
		if(cache && cache.session){ sid = cache.session; }
		if(!sid){
			cache.session = sid = generate.uid();
			libsb.session = cache.session;
		} 
		core.emit('init-up', {session: sid});
		n();
	}, 500);
	
	core.on('away-dn', function(away, next){
		// store a result-end to the end of ArrayCache to show that the text stream is over for the current user
		var msg = {type: 'result-end', endtype: 'time', time: away.time};
		var key = generateLSKey(away.to, 'texts');
		if(cache && cache[key]){ cache[key].put(msg); }
		next();
	}, 500);
	
	core.on('connected', function(data, next) {
		if (window.parent.location === window.location) {
			createInit();
            next();
		} else {
			if(!messageListener) {
				$(window).on("message", function(e) {
					var data = e.originalEvent.data;
					try { data = JSON.parse(data);} catch(e) {return;}
					if (typeof data === "object" && data.location) {
						domain = data.location.host;
						path = data.location.pathname;
					}
					createInit();
                    next();
				});
				window.parent.postMessage("getDomain", "*");
				messageListener = true;
			} else {
                createInit();
                next();
            }
		}
		
	}, 1000);
	core.on('logout', logout, 1000);
};

function createInit(){
	var sid;
	if(!cache){ cache = {}; }
	if(cache && cache.session) {
        libsb.session = sid = cache.session;
    }
	if(!sid){
		cache.session = sid = "web:"+generate.uid();
		libsb.session = cache.session;
	}
	core.emit('init-up', {session: sid, origin: {
		gateway: "web",
		domain: domain,
		path: path
	}});
}

function logout(p,n){
	// delete user session here
	delete cache.session;
	delete cache.user;
	delete libsb.session;
	delete libsb.user;
	localStorage.clear(); // clear LocalStorage on logout for security reasons
	save();
	n();
}
