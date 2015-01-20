var log = require('../lib/logger.js');
exports.getTexts = function(query, texts) {
	var results = [];
	if (texts.length) {
		texts[0].rows.forEach(function(row) {
			var labels = {};
			row.tags.forEach(function(tag) {
				labels[tag] = 1;
			});
			var text = {
				id: row.id, 
				to: row.to,
				from: row.from,
				text: row.text,
				type: row.type,
				thread: row.thread,
				title: row.title,
				tags: row.tags,
				threads: [{id: row.thread, title: row.title, score: 1}], // backward compatibility
				labels: labels, // backward compatibility
				mentions: row.mentions,
				time: row.time
			};
			results.push(text);
		});

		if (query.before) {
			results.reverse();
		} else if (query.ref instanceof Array) { //order based on ref
			var tr = results;
			var textPosMap = {};
			results = [];
			for (var i = 0;i < query.ref.length;i++) {
				textPosMap[query.ref[i]] = i;
				results.push(null);
			}
			tr.forEach(function(room) {
				results[textPosMap[room.id]] = room;
			});
		}
	}
	return results;	
};

exports.getThreads = function(threads) {
//	var i, l = threads.length, thread;
//	
//	for(i=0; i<l; i++) {
//		
//	};
	return threads;
};

exports.getRooms = exports.getUsers = exports.getEntities = function(query, entities) {
	log.d("Entities: ", entities);
	
	var results = [];
	if (entities.length) {
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

		if (query.before) {
			results.reverse();
		} else if (query.ref instanceof Array) {
			var tr = results;
			var roomPosMap = {};
			results = [];
			for (var i = 0;i < query.ref.length;i++) {
				roomPosMap[query.ref[i]] = i;
				results.push(null);
			}
			tr.forEach(function(room) {
				results[roomPosMap[room.id]] = room;
			});
		}
	}
	//var i, l = entities.length, entity;
	
	/*for(i=0; i<l; i++) {
		entity = entities[i];
		if(entity.room) delete entity.room;
		if(entity.user) delete entity.user;
	}*/
	
	return results;
};

