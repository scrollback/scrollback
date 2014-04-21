/* global localStorage */
/* global window */
var ArrayCache = require('./ArrayCache.js');
var generate = require('../lib/generate');
var cache;

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

module.exports = function(core){
	if(localStorage.user){
		var fakeInit = {
			user: cache.user,
			rooms: cache.rooms,
			occupantOf: cache.occupantOf,
			memberOf: cache.memberOf
		};
		core.emit('init-dn', fakeInit);
	}
	
	core.on('getTexts', getTextsBefore, 400);
	core.on('getTexts', getTextsAfter, 600);
	core.on('getLabels', getLabelsBefore, 400);
	core.on('getLabels', getLabelsAfter, 600);
	core.on('connected', createInit);
	core.on('init-dn', recvInit);
	core.on('away-up', storeAway);
	core.on('text-up', storeText);
	
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
	var sid = cache.session;
	if(!sid) cache.session = sid = generate.guid();
	core.emit('init-up', {session: sid});
}

function storeAway(away, next){
	localStorage.libsb.lastAwayAt = away.time;
	save();
	next();
}

function logout(){
	// delete user session here
	delete cache.session;
	save();
}

function storeText(text, next){
	cache.texts.merge([text]);
	save();
	next();
}

function getTextsBefore(query, next){
	var results = cache.texts.get(query);
	if(results) query.results = results;
	next();
}

function getTextsAfter(query, next){
	var results = query.results; 
	if(results) cache.texts.merge(results);
	next();
}

function getLabelsBefore(query, next){
	var results = cache.labels.get(query);
	if(results) query.results = results;
	next();
}

function getLabelsAfter(query, next){
	var results = query.results;
	if(results) cache.labels.merge(results);
	next();
}