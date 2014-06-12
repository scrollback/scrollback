/* global localStorage */
/* global window, libsb, QUOTA_EXCEEDED_ERR */
var ArrayCache = require('./ArrayCache.js');
var generate = require('../lib/generate');
var cache = {}, core;
var LRU = {};

// add values to LRU 

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

function getLSkey(){
        var args = Array.prototype.slice.call(arguments, 0); 
        var argumentsLC = args.map(function(val){
            return val.toLowerCase();
        });
        return argumentsLC.join('_');
}

libsb.on('navigate', function(state, next){
    if(state.room !== state.old.room){
        var lsKeyTexts = getLSkey(state.room, 'texts');
        var lsKeyLabels = getLSkey(state.room, 'labels');
        
        console.log("ON navigate ", localStorage[lsKeyTexts]);
        if(localStorage.hasOwnProperty(lsKeyTexts)) cache[lsKeyTexts] = new ArrayCache(JSON.parse(localStorage[lsKeyTexts]));
        else cache[lsKeyTexts] = new ArrayCache([]);
       
        //if(localStorage.hasOwnProperty(lsKeyLabels)) cache[lsKeyLabels] = new ArrayCache(JSON.parse(localStorage[lsKeyLabels]));
        //else cache[lsKeyLabels] = new ArrayCache([]);
    }
    next();
});

function load(roomName, dataType){
	var lsKey = getLSkey(roomName, dataType);
        cache[lsKey] = new ArrayCache(JSON.parse(localStorage[lsKey]));
        /*if(localStorage[lsKey]){
		cache[lsKey] = JSON.parse(localStorage[lsKey]);
		cache[lsKey] = new ArrayCache(cache[lsKey]);
                //cache.texts = cache.texts || [];
		//cache.texts = new ArrayCache(cache.texts);
		//cache.labels = new ArrayCache(cache.labels);
	}*/
}

function save(roomName, dataType){
     try{
        var lsKey = getLSkey(roomName, dataType);
        localStorage[lsKey] = JSON.stringify(cache[lsKey]);
        LRU[lsKey] = new Date().getTime();
     }catch(e){
        if (e.name == 'QuotaExceededError' || e.code == 22){ // localStorage quota has been exceeded
            deleteLRU();
            save(roomName, dataType);
        }
     }
}

// load();

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
	
	core.on('getTexts', getTextsBefore, 900);
	core.on('getTexts', getTextsAfter, 9); // runs after socket
	core.on('getThreads', getThreadsBefore, 900);
	core.on('getThreads', getThreadsAfter, 400);
	core.on('connected', createInit);
	core.on('init-dn', recvInit);
	core.on('away-up', storeAway);
	core.on('text-up', storeText);
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
	
	core.on('logout', logout);
	
	window.addEventListener('storage', load);
};

function recvInit(init, next){
	cache.user = init.user;
	cache.rooms = init.rooms;
	cache.occupantOf = init.occupantOf;
	cache.memberOf = init.memberOf;
	save();
	next();
}

function createInit(){
	var sid;
	if(!cache) cache = {};
	if(cache && cache.session) sid = cache.session;
	if(!sid){
		cache.session = sid = generate.uid();
		libsb.session = cache.session;
	} 
	core.emit('init-up', {session: sid});
}

function storeAway(away, next){
	localStorage.libsb.lastAwayAt = away.time;
	save();
	next();
}

function logout(p,n){
	// delete user session here
	delete cache.session;
	delete cache.user;
	delete libsb.session;
	delete libsb.user;
	save();
	n();
}

function storeText(text, next){
	cache.texts.put([text]);
	save();
	next();
}

function getTextsBefore(query, next){
    var room = query.to;
    var lsKey = getLSkey(room, 'texts');
    var results = cache[lsKey].get(query);
    if(results && results.length > 0) query.results = results;
	next();
}

function getTextsAfter(query, next){
	var results = query.results; 
    console.log("IN get texts after, results : ", query.results);
	if(results && results.length){
		if(query.before) results.push({type: 'result-end', endtype: 'time', time: query.time});
		if(query.after) results.unshift({type: 'result-start', endtype: 'time', time: query.time});

		if(query.before && results.length === query.before){
			results.unshift({
				type: 'result-start', time: results[0].time, endtype: 'limit'
			});
		}

		if(query.after && results.length === query.after){
			results.push({
				type: 'result-end', time: results[results.length - 1].time, endtype: 'limit'
			});
		}
        var lsKey = getLSkey(query.to, 'texts');
		cache[lsKey].put(results);
        save(query.to, 'texts');
	}
	next();
}

function getThreadsBefore(query, next){
	/* not giving the correct data right now.
	var results = cache.labels.get(query);
	if(results) query.results = results;*/
	next();
}

function getThreadsAfter(query, next){
	var results = query.results;
	if(results){
		if(query.before) results.push({type: 'result-end', endtype: 'time', time: query.time});
		if(query.after) results.unshift({type: 'result-start', endtype: 'time', time: query.time});

		if(query.before && results.length === query.before){
			results.unshift({
				type: 'result-start', time: results[0].time, endtype: 'limit'
			});
		}

		if(query.after && results.length === query.after){
			results.push({
				type: 'result-end', time: results[results.length - 1].time, endtype: 'limit'
			});
		}
		cache.labels.put(results);	
	} 
	next();
}
