/* global localStorage */
/* global window, libsb */
var ArrayCache = require('./ArrayCache.js');
var generate = require('../lib/generate');
var cache, core;
var messageListener = false;
var domain = location.host;
var path = location.pathname;


function load(){
	if(localStorage.libsb){
		cache = JSON.parse(localStorage.libsb);
		cache.texts = cache.texts || [];
		cache.texts = new ArrayCache(cache.texts);
		cache.labels = new ArrayCache(cache.labels);
	}
}

function save(){
	localStorage.libsb = JSON.stringify(cache);
}

load();

module.exports = function(c){
	core = c;
	if(localStorage.libsb){
		var fakeInit = {
			user: cache.user,
			rooms: cache.rooms,
			occupantOf: cache.occupantOf,
			memberOf: cache.memberOf
		};
		//core.emit('init-dn', fakeInit);
	}

	core.on('getTexts', getTextsBefore, 400);
	core.on('getTexts', getTextsAfter, 900);
	core.on('getThreads', getThreadsBefore, 400);
	core.on('getThreads', getThreadsAfter, 900);
	core.on('connected', function() {
		if (window.parent.location === window.location) {
			createInit();	
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
				});
				window.parent.postMessage("getDomain", "*");
				messageListener = true;
			} else createInit();
		}
		
	}, 1000);
	core.on('init-dn', recvInit, 900);
	core.on('away-up', storeAway, 100); // can be in the end.
	//core.on('text-up', storeText);

	core.on('logout', logout, 1000);

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
	if(cache && cache.session) {
        libsb.session = sid = cache.session;
    }
	if(!sid){
		cache.session = sid = generate.uid();
		libsb.session = cache.session;
	}
	core.emit('init-up', {session: sid, origin: {
		gateway: "web",
		domain: domain,
		path: path
	}});
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

	/*
		not giving the correct data right now.
		var results = cache.texts.get(query);
	if(results) query.results = results;*/
	next();
}

function getTextsAfter(query, next){
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

		cache.texts.put(results);
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
