/* global localStorage */
/* global $, libsb, location, window, timeoutMapping */
var ArrayCache = require('./ArrayCache.js');
var generate = require('../lib/generate');
var cache = {},
	core;
var LRU = {};
var messageListener = false;
var domain = location.host;
var path = location.pathname;
var config = require('../client-config.js');

window.timeoutMapping = {};
window.backTimes = {};

(function updateLS() {
	var version = 'version' + config.localStorage.version;
	if (!localStorage.hasOwnProperty(version)) {
		console.log("Old version of LocalStorage present, clearing ...");
		localStorage.clear();
		localStorage[version] = true;
	} else {
		console.log("LocalStorage version is current ...");
	}
})();

function loadArrayCache(key) {
	// loads an ArrayCache from LocalStorage.
	var texts;
	if (localStorage.hasOwnProperty(key)) {
		try {
			texts = JSON.parse(localStorage[key]);
		} catch (e) {
			texts = [];
		}
		return (new ArrayCache(texts));
	} else {
		return (new ArrayCache([]));
	}
}

function saveCache(key) {
	// saves an ArrayCache to LocalStorage
	try {
		localStorage[key] = JSON.stringify(cache[key].d);
	} catch (e) {
		if (e.name == 'QuotaExceededError' || e.code == 22) { // localStorage is full!
			deleteLRU();
			saveCache(key);
		}
	}
	LRU[key] = new Date().getTime();
	save();
}

function generateLSKey() {
	var args = Array.prototype.slice.call(arguments, 0);
	if (!args) {
		return;
	}
	var argumentsLC = args.map(function (val) {
		if(typeof val == "string") return val.toLowerCase();
	});
	return argumentsLC.join('_');
}

function deleteLRU() {
	// deletes the least recently used entry from LocalStorage
	var leastTime = Infinity,
		leastEntry;
	for (var i in LRU) {
		if (LRU[i] < leastTime) {
			leastTime = LRU[i];
			leastEntry = i;
		}
	}
	if (leastTime != Infinity) {
		delete LRU[leastEntry];
		delete localStorage[leastEntry];
	}
}

function save() {
	//saves user, session, LRU, rooms, occupantOf, memberOf to LocalStorage
	localStorage.user = JSON.stringify(cache.user);
	localStorage.session = cache.session;
	localStorage.LRU = JSON.stringify(LRU);
	localStorage.occupantOf = JSON.stringify(cache.occupantOf);
	localStorage.memberOf = JSON.stringify(cache.memberOf);
}


try {
	cache.user = JSON.parse(localStorage.user);
	cache.session = localStorage.session;
	LRU = JSON.parse(localStorage.LRU);
	cache.occupantOf = JSON.parse(localStorage.occupantOf);
	cache.memberOf = JSON.parse(localStorage.memberOf);
} catch (e) {
	// do nothing, e is thrown when values do not exist in localStorage,
	// which is a valid scenario, execution must continue.
}

libsb.on('init-up', function(init, next) {
    var sid;
    if(cache && cache.session) {
        libsb.session = sid = cache.session;
    }
    if(!sid) {
		cache.session = sid = "web://"+generate.uid();
		libsb.session = cache.session;
	}
    return next();
}, "validation");

libsb.on('back-dn', function (back, next) {
	if (back.from !== libsb.user.id) return next();

	// loading ArrayCache from LocalStorage when user has navigated to the room.
	window.backTimes[back.to] = back.time;
	var o;
	var key = generateLSKey(back.to, 'texts');
	var thKey = generateLSKey(back.to, 'threads');
	var roomName = back.to;
	var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
	
	// load all ArrayCaches with <roomName>*_texts
	for (o in localStorage){
		if(regex.test(o)){
			cache[o] = loadArrayCache(o);
		}	
	}
	// loading <roomName>_threads
	cache[thKey] = loadArrayCache(thKey);
	var items = cache[key].d;
	var lastMsg = items[items.length - 1];
	var msg = {
			type: 'result-end',
			endtype: 'time',
			time: lastMsg ? lastMsg.time : null
	};
	if (lastMsg && lastMsg.type !== "result-end") {
		cache[key].d.push(msg);
	}
	saveCache(key);

	for (o in cache) {
		if (regex.test(o)) {
			var lastItem = cache[o][cache[o].length - 1];
			if (lastItem && lastItem.type !== 'result-end') cache[o].d.push('time', msg);
			saveCache(o);
		}
	}

	next();
}, 1000);
module.exports = function (c) {
	core = c;

    core.on('back-dn', function (back, next) {
		// store a result-start in ArrayCache, to indicate the beginning of the current stream of messages from the user
		if (back.from !== libsb.user.id) return next();
		var msg = {
			type: 'result-start',
			endtype: 'time',
			time: back.time
		};
		var key = generateLSKey(back.to, 'texts');
		if (cache && cache.hasOwnProperty(key)) {
			cache[key].d.push(msg);
		}
		saveCache(key);

		var roomName = back.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
		for (var o in cache) {
			if (regex.test(o)) {
				var lastItem = cache[o][cache[o].length - 1];
				if (lastItem && lastItem.type !== 'result-start') cache[o].d.push('time', msg);
				saveCache(o);
			}
		}

		next();
	}, 500);

	core.on('getTexts', function (query, next) {
		// getTextsBefore
		var key;
		
		if (query.thread) {
			// creating individual cache entries for queries with the thread property
			key = generateLSKey(query.to, query.thread, 'texts');
		} else {
			key = generateLSKey(query.to, 'texts');
		}
		if (!cache.hasOwnProperty(key)) {
			cache[key] = loadArrayCache(key);
		}

		if (!cache[key].d.length) {
			return next();
		}
		
		if(query.time === null){
			// query.time is null, have to decide how LS will handle this.
			return next();
		}
		
		if(query.thread) return next();
		
		var results = cache[key].get('time', query);

		if (!results || !results.length) {
			return next();
		} else {
			query.results = results;
			query.resultSource = 'localStorage';
			return next();
		}
	}, 200); // runs before the socket

	core.on('getTexts', function (query, next) {
        var results = query.results;
        
		if (!query.results || !query.results.length || query.resultSource == 'localStorage') {
			return next();
		}
        results = query.results.slice(0); // copying by value
		if (results && results.length > 0) {
			// merging results into the Cache.
			if (query.before) {
				if (results.length === query.before) {
					results.unshift({
						type: 'result-start',
						time: results[0].time,
						endtype: 'limit'
					});
				}
				results.push({
					type: 'result-end',
					endtype: 'time',
					time: query.time
				});
			} else if (query.after) {
				if (results.length === query.after) {
					results.push({
						type: 'result-end',
						time: results[results.length - 1].time,
						endtype: 'limit'
					});
				}
				results.unshift({
					type: 'result-start',
					endtype: 'time',
					time: query.time
				});
			}
			var lskey = generateLSKey(query.to, 'texts');
			if (!cache.hasOwnProperty(lskey)) {
				loadArrayCache(lskey);
			}
			cache[lskey].put('time', results);

			if (query.thread) {
				// save into thread cache as well 
				var lsThreadKey = generateLSKey(query.to, query.thread, 'texts');
				if (!cache.hasOwnProperty(lsThreadKey)) {
					loadArrayCache(lsThreadKey);
				}
				cache[lsThreadKey].put('time', results);
				saveCache(lsThreadKey);
			}

			saveCache(lskey);
		}
		next();
	}, 8); // runs after the socket
	core.on('getThreads', function (query, next) {
		var key = generateLSKey(query.to, 'threads');
		if (!cache.hasOwnProperty(key)) {
			cache[key] = loadArrayCache(key);
		}

		if (!cache[key].d.length) {
			return next();
		}
		
		if(query.time === null){
			// query.time is null, have to decide how LS will handle this.
			return next();
		}

		var results = cache[key].get('startTime', query);

		if (!results || !results.length) {
			return next();
		} else {
			query.results = results;
			query.resultSource = 'localStorage';
			return next();
		}
	}, 200); // runs before the socket

	core.on('getThreads', function (query, next) {
		if (query.resultSource === 'localStorage') {
			return next();
		}
		var results = query.results.slice(0); // copy by value
		if (results && results.length > 0) {
			// merge results to cache
			if (query.before) {
				if (results.length === query.before) {
					results.unshift({
						type: 'result-start',
						startTime: results[0].startTime,
						endtype: 'limit'
					});
				}
				results.push({
					type: 'result-end',
					endtype: 'time',
					startTime: query.time
				});
			} else if (query.after) {
				if (results.length === query.after) {
					results.push({
						type: 'result-end',
						startTime: results[results.length - 1].startTime,
						endtype: 'limit'
					});
				}
				results.unshift({
					type: 'result-start',
					endtype: 'time',
					startTime: query.time
				});
			}
			var lskey = generateLSKey(query.to, 'threads');
			if (!cache.hasOwnProperty(lskey)) {
				loadArrayCache(lskey);
			}
			cache[lskey].put('startTime', results);
			saveCache(lskey);
		}
		next();
	}, 8); // runs after socket 

	core.on('getRooms', function (query, next) {

		// only getRooms with ref are cached as of now.

		if (!query.ref) {
			return next();
		}

		var rooms = {};

		rooms = cache.rooms || {};

		if (rooms.hasOwnProperty(query.ref)) {
			query.results = [rooms[query.ref]];
		}

		next();

	}, 400); // run before socket

	function delRoomTimeOut(roomId) {
		// this function deletes a saved room object from the cache every 'n' mintues
		var minutes = 10; // 10 minutes timeout

		clearTimeout(timeoutMapping[roomId]);

		timeoutMapping[roomId] = setTimeout(function () {
			if (cache && cache.rooms) {
				delete cache.rooms[roomId];
			}
		}, minutes * 60 * 1000);
	}

	core.on('getRooms', function (query, next) {

		if (!query.ref) {
			return next();
		}

		var rooms = {};

		rooms = cache.rooms ? cache.rooms : {};

		if (query.results) {
			query.results.forEach(function (room) {
				rooms[room.id] = room;
				delRoomTimeOut(room.id);
			});
		}

		cache.rooms = rooms;
		next();

	}, 8); // run after socket

	core.on('text-dn', function (text, next) {
		var texts = [text];
		var key = generateLSKey(text.to, 'texts');
		var lastItem = cache[key].d[cache[key].length - 1];

		if (lastItem && lastItem.type === 'result-end') texts.unshift({
			type: 'result-start',
			endtype: 'time',
			time: window.backTimes[text.to]
		});

		if (cache && cache[key]) {
			cache[key].put('time', texts);
			saveCache(key);
		}

		// putting the incoming text into each threadId cache it is a part of
        if (text.threads) {
            text.threads.forEach(function (threadObj) {
                texts = [text];
                key = generateLSKey(text.to, threadObj.id, 'texts');

                cache[key] = loadArrayCache(key);
                lastItem = cache[key].d[cache[key].length - 1];

                if (!lastItem || lastItem.type === 'result-end') texts.unshift({
                    type: 'result-start',
                    endtype: 'time',
                    time: window.backTimes[text.to]
                });
                cache[key].put('time', texts);
                saveCache(key);
            });
        }
		next();
	}, 500); // storing new texts to cache.

	core.on('room-dn', function (room, next) {
		var roomObj = room.room;
		if (cache) {
			cache.rooms = cache.rooms ? cache.rooms : {};
			cache.rooms[roomObj.id] = roomObj;
			delRoomTimeOut(roomObj.id);
		}
		next();
	}, 500);

	core.on('init-dn', function (init, next) {
		cache.user = init.user;
		cache.occupantOf = init.occupantOf;
		cache.memberOf = init.memberOf;

		// caching occupantOf and memberOf to cache.rooms

		cache.rooms = cache.rooms ? cache.rooms : {};

		init.occupantOf.forEach(function (room) {
			cache.rooms[room.id] = room;
			delRoomTimeOut(room.id);
		});

		init.memberOf.forEach(function (room) {
			cache.rooms[room.id] = room;
			delRoomTimeOut(room.id);
		});

		save();
		next();
	}, 500);

	core.on('away-dn', function (away, next) {
		// store a result-end to the end of ArrayCache to show that the text stream is over for the current user
		if(away.from !== libsb.user.id) return next();
		var msg = {type: 'result-end', endtype: 'time', time: away.time};
		var key = generateLSKey(away.to, 'texts');
		if (cache && cache[key]) {
			cache[key].d.push('time', msg);
			saveCache(key);
		}
		// soln below is generic for all subthreads in a room.

		var roomName = away.to;
		var regex = new RegExp(roomName + '(_.+)?_' + 'texts');
		for (var o in cache) {
			if (regex.test(o)) {
				var lastItem = cache[o][cache[o].length - 1];
				if (lastItem && lastItem.type !== 'result-end') cache[o].d.push('time', msg);
				saveCache(o);
			}
		}

		next();
	}, 500);

	core.on('logout', logout, 1000);
};

function logout(p, n) {
	// delete user session here
	delete cache.session;
	delete cache.user;
	delete libsb.session;
	delete libsb.user;
	localStorage.clear(); // clear LocalStorage on logout for security reasons
	save();
	n();
}
