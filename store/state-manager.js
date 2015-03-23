/* jshint browser: true */

var config, store;
var objUtils = require("./../lib/obj-utils.js");
var rangeOps = require("./range-ops.js");
var state;

module.exports = function(core, conf, s, st) {
	config = conf;
    store = s;
	state = st;

	core.on("setstate", function(changes, next) {
		if (changes.nav) objUtils.extend(state.nav, changes.nav);
		if (changes.context) objUtils.extend(state.context, changes.context);
		if (changes.app) objUtils.extend(state.app, changes.app);

		if (changes.entities) updateEntities(state.entities, changes.entities);
		if (changes.texts) updateTexts(changes.texts);
		if (changes.threads) updateThreads(changes.threads);
		if (changes.session) updateSession(changes.session);
		if (changes.user) updateCurrentUser(changes.user);

		buildIndex(changes);
		buildIndex(state, changes);
		
//		console.log('state changed to', state);
		
		core.emit("statechange", changes);
		next();
	}, 1);
};

function updateThreads(threads) {
	var rooms = Object.keys(threads), ranges;

	rooms.forEach(function(roomId) {
		ranges = store.get("threads", roomId);
		if(!ranges) ranges = state.threads[roomId] = [];

		if(threads[roomId].length) {
			threads[roomId].forEach(function(newRange) {
				state.threads[roomId] = rangeOps.merge(ranges, newRange, "startTime");
			});
		} else {
			console.log(roomId + ' has no threads yet.');
		}
	});
}

function updateSession(session) {
	console.log('Session updating to', session);
	state.session = session;
}

function updateCurrentUser(user) {
	state.user = user;
}

function updateTexts(texts) {
	var rooms = Object.keys(texts), ranges;

	rooms.forEach(function(roomThread) {
		ranges = store.get("texts", roomThread);

		if (!ranges) {
			ranges = state.texts[roomThread] = [];
		}

		if (texts[roomThread].length) {
			texts[roomThread].forEach(function(newRange) {
				state.texts[roomThread] = rangeOps.merge(ranges, newRange, "time");
			});
		} else {
			console.log(roomThread);
		}
	});
}

function buildIndex(obj, changes) {
	var relation;
	
	// Changes are passed so that we don’t waste time rebuilding indexes that are still valid.
	if(!changes) changes = obj;

	obj.indexes = obj.indexes || {
		userRooms: {},
		roomUsers: {},
		textsById: {},
		threadsById: {}
	};

	if (obj.entities && changes.entities) {
		obj.indexes.userRooms = {};
		obj.indexes.roomUsers = {};
		for (var name in obj.entities) {
			relation = obj.entities[name];
			if (relation && relation.room && relation.user) {
				(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
				(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
			}
		}
	}
	
	
	/* jshint -W083 */
	function buildRangeIndex(obj, prop) {
		var index = obj.indexes[prop+'ById'] = {};
		for(var room in obj[prop]) {
			if(obj[prop][room].forEach) obj[prop][room].forEach(function (range) {
				range.items.forEach(function (item) {
					index[item.id] = item;
				});
			});
		}
	}
	/* jshint +W083 */
	
	if(obj.threads && changes.threads) buildRangeIndex(obj, 'threads');
	if(obj.texts && changes.texts) buildRangeIndex(obj, 'texts');
}

function updateEntities(stateEntities, changesEntities) {
	objUtils.extend(stateEntities, changesEntities);
}

