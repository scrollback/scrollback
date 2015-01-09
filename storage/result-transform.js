var log = require('../lib/logger.js');
exports.getTexts = function(/*texts*/) {
	/*var i, l = texts.length, text, t;
	
	for(i=0; i<l; i++) {
		text = texts[i], t = {};
		t[text.thread] = 1;
		text.threads = [t];
	};
	return texts;*/
};

exports.getThreads = function(threads) {
//	var i, l = threads.length, thread;
//	
//	for(i=0; i<l; i++) {
//		
//	};
	return threads;
};

exports.getRooms = exports.getUsers = exports.getEntities = function(entities) {
	log.d("Entities: ", entities);
	var results = [];
	entities[0].rows.forEach(function(row) {
		var identities = [];
		row.identities.forEach(function(identity) {
			identities.push(identity[1]);
		});
		var entity = {
			id: row.id,
			type: row.type,
			createTime: row.createtime,
			description: row.description,
			identities: identities,
			params: row.params,
			guides: row.guides,
			picture: row.picture,
			timezone: row.timezone
		};
		results.push(entity);
	});
	
	//var i, l = entities.length, entity;
	
	/*for(i=0; i<l; i++) {
		entity = entities[i];
		if(entity.room) delete entity.room;
		if(entity.user) delete entity.user;
	}*/
	
	return results;
};

