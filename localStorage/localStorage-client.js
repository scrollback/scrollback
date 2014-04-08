ArrayCache = require('./ArrayCache.js');
var cache;

function load(){
	cache = JSON.parse(localStorage.libsb);
	cache.texts = new ArrayCache(cache.texts);
	cache.labels = new ArrayCache(cache.labels);
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
	
	
	core.on('getTexts', getTexts);
	core.on('getLabels', getLabels);
	
	core.on('connected', createInit);
	
	core.on('init-dn', recvInit);
	
	core.on('away-up', storeAway);
	core.on('text-up', storeText);
//	core.on('back-up', sendBack);
//	core.on('join-up', sendJoin);
//	core.on('part-up', sendPart);
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

function storeText(text, next){
	cache.texts.merge([text]);
	save();
	next();
}

function recvInit(init, next){
	cache.user = init.user;
	cache.rooms = init.rooms;
	cache.occupantOf = init.occupantOf;
	cache.memberOf = init.memberOf;
	save();
	next();
}

function getTexts(query, next, partialOk) {
	var partial = false, missing
		data = cache.texts.extract(, , , function(start, end) {
			partial = true;
			if(partialOk) {
				core.emit(''query.onPartUpdate
			}
		});
	if(partialOk || !partial) {
		query.results = data;
	}
	next();
}

//function getPartial() {
//	var data = cache.texts.extract(, , , function(start, end) {
//		generateNewQuery
//		return {type: 'text-missing'};
//	})
//	query.results = data;
//	next();
//}

function getTexts(query, next){
	var results = cache.texts.get(query);
	if(results) query.results = results;
	next();
}

function getLabels(query, next){
	var results = cache.labels.get(query);
	if(results) query.results = results;
	next();
}