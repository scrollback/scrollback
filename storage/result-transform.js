'use strict';
var log = require('../lib/logger.js');
exports.getTexts = function(query, texts) {
	log("Texts:", texts);
	var results = [];
	if (texts.length) {
		texts[0].rows.forEach(function(row) {
			var text = {
				id: row.id,
				to: row.to,
				from: row.from,
				text: row.text,
				type: row.type,
				thread: row.thread,
				title: row.title,
				tags: row.tags,
				mentions: row.mentions,
				time: row.time.getTime()
			};
			results.push(text);
		});

		if (query.before) {
			results.reverse();
		} else if (query.ref instanceof Array) { //order based on ref
			results = orderResultsBasedOnRef(query, results);
		}
	}
	return results;
};

exports.getThreads = function(query, threads) {
	log("Threads:", threads);
	var results = [];
	if (threads.length) {
		threads[0].rows.forEach(function(row) {
			var thread = {
				id: row.id,
				to: row.to,
				from: row.from,
				title: row.title,
				color: row.color,
				tags: row.tags,
				time: row.time,
				terms: row.terms,
				updater: row.updater,
				startTime: row.starttime.getTime(),
				updateTime: row.updatetime.getTime()
			};
			results.push(thread);
		});

		if (query.before) {
			results.reverse();
		} else if (query.ref instanceof Array) { //order based on ref
			results = orderResultsBasedOnRef(query, results);
		}
	}
	return results;
};

exports.getRooms = exports.getUsers = exports.getEntities = function(query, entities) {
	log("Entities:", entities);
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
				createTime: (row.createtime ? row.createtime.getTime() : null),
				description: row.description,
				identities: identities,
				params: row.params,
				guides: row.guides,
				picture: row.picture,
				timezone: row.timezone,
				role: row.role,
				roleSince: row.roletime
			};
			if(row.transitiontype) entity.transitionType = row.transitiontype;
			if(row.transitionrole) entity.transitionRole = row.transitionrole;
			if(row.officer) entity.officer = row.officer;
			log.d(entity);
			results.push(entity);
		});

		if (query.before) {
			results.reverse();
		} else if (query.ref instanceof Array) {
			results = orderResultsBasedOnRef(query, results);
		}
	}

	return results;
};


function orderResultsBasedOnRef(query, results) {
	var tr = results;
	var posMap = {};
	results = [];
	for (var i = 0; i < query.ref.length; i++) {
		posMap[query.ref[i]] = i;
		results.push(null);
	}
	tr.forEach(function(room) {
		results[posMap[room.id]] = room;
	});
	return results;
}
