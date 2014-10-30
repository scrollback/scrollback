exports.getTexts = function(texts) {
	var i, l = texts.length, text, t;
	
	for(i=0; i<l; i++) {
		text = texts[i], t = {};
		t[text.thread] = 1;
		text.threads = [t];
	};
	return texts;
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
	var i, l = entities.length, entity;
	
	for(i=0; i<l; i++) {
		entity = entities[i];
		if(entity.room) delete entity.room;
		if(entity.user) delete entity.user;
	}
	
	return entities;
};

