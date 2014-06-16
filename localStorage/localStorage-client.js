/* global localStorage */
/* global libsb*/
var ArrayCache = require('./ArrayCache.js');
var generate = require('../lib/generate');
var cache = {}, core;
var LRU = {};

function loadArrayCache(key){
	// loads an ArrayCache from LocalStorage.
	var texts;
	if(localStorage.hasOwnProperty(key)){
		try{
			texts = JSON.parse(localStorage[key]);
		}catch(e){
			texts = [];
		}
		return (new ArrayCache(texts));
	}else {
		return (new ArrayCache([]));
	}
}

function saveCache(key){
	// saves an ArrayCache to LocalStorage
	console.log("Saving arrayCache ", key);
	try{
		localStorage[key] = JSON.stringify(cache[key].getItems());
	}catch(e){
		if(e.name == 'QuotaExceededError' || e.code == 22){
			deleteLRU();
			saveCache(key);
		}
	}
	LRU[key] = new Date().getTime();
}

function generateLSKey(){
	var args = Array.prototype.slice.call(arguments, 0); 
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
	localStorage.rooms = JSON.stringify(cache.rooms);
	localStorage.occupantOf = JSON.stringify(cache.occupantOf);
	localStorage.memberOf = JSON.stringify(cache.memberOf);
}

(function load(){
	// loads entries saved by save()
	try{
		cache.user = JSON.parse(localStorage.user);
		cache.session = localStorage.session;
		LRU = JSON.parse(localStorage.LRU);
		cache.rooms = JSON.parse(localStorage.rooms);
		cache.occupantOf = JSON.parse(localStorage.occupantOf);
		cache.memberOf = JSON.parse(localStorage.memberOf);	
	}catch(e){
		// do nothing, e is thrown when values do not exist in localStorage, 
		// which is a valid scenario, execution must continue.
	}
})();

libsb.on('navigate', function(state, next){
	if(state.room && state.room!=state.old.room){
		var key = generateLSKey(state.room, 'texts');
		if(localStorage.hasOwnProperty(key)){
			cache[key] = loadArrayCache(key);
		}
	}
	next();
});

module.exports = function(c){
	core = c;
	if(localStorage.user){
		var fakeInit = {
			user: cache.user,
			rooms: cache.rooms,
			occupantOf: cache.occupantOf,
			memberOf: cache.memberOf
		};
		core.emit('init-dn', fakeInit);
	}
	core.on('getTexts', function(query, next){
		// getTextsBefore
		var key = generateLSKey(query.to, 'texts');
		if(!cache.hasOwnProperty(key)){
			cache[key] = loadArrayCache(key);
		}
		
		var results = cache[key].get(query);
		
		
		if(!results || !results.length){
			next();
		}else{
			query.results = results;
			next();
		}
		
		next();
	}, 200); // runs before the socket
	
	core.on('getTexts', function(query, next){
		var results = query.results;
		if(results && results.length > 0){
			// merging results into the Cache.
			if(query.before){
				results.push({type: 'result-end', endtype: 'time', time:query.time});
			}
			if(query.after){
				results.unshift({type: 'result-start', endtype: 'time', time: query.time});
			}
			if(query.before && results.length === query.before){
				results.unshift({type: 'result-start', time: results[0].time, endtype: 'time'});
			}
			if(query.after && results.length === query.after){
				results.unshift({type: 'result-end', time: results[results.length - 1].time, endtype: 'time'});
			}
			var lskey = generateLSKey(query.to, 'texts');
			if(!cache.hasOwnProperty(lskey)) loadArrayCache(lskey);
			cache[lskey].put(results);
			saveCache(lskey);
		}
		next();
	}, 8); // runs after the socket
	
	core.on('text-dn', function(text, next){
		var texts = [text];
		texts.unshift({type: 'result-start', endtype: 'time', time: text.time});
		texts.push({type: 'result-end', endtype: 'time', time: text.time});
		var key = generateLSKey(text.to, 'texts');
		cache[key].put(texts);
		saveCache(key);
		next();
	}); // storing new texts to cache.
	
	core.on('connected', function(){
		var sid;
		if(!cache) cache = {};
		if(cache && cache.session) sid = cache.session;
		if(!sid){
			cache.session = sid = generate.uid();
			libsb.session = cache.session;
		} 
		core.emit('init-up', {session: sid});
	});
	
	core.on('init-dn', function(init, next){
		cache.user = init.user;
		cache.rooms = init.rooms;
		cache.occupantOf = init.occupantOf;
		cache.memberOf = init.memberOf;
		save();
		next();
	});
	
	core.on("getSession", function(query, callback){
		try {
			query.results = [{
				session: cache.session,
				user: cache.user.id
			}];
			callback();	
		}catch(e){
			callback(e);
		}
	});
	
	core.on('logout', function(p,n){
		// delete user session here
		delete cache.session;
		delete cache.user;
		delete libsb.session;
		delete libsb.user;
		save();
		n();
	});
};