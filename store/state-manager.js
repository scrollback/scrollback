/* jshint browser: true */
var config, store;
var objUtils = require("./../lib/obj-utils.js");
var rangeOps = require("./range-ops.js");
var state;
module.exports = function(core, conf, s, st) {
	config = conf;
    store = s;
	state = st;
	window.state = state;
	core.on("setstate", function(changes, next) {
		if (changes.nav) objUtils.extend(state.nav, changes.nav);
		if (changes.context) objUtils.extend(state.context, changes.context);
		if (changes.app) objUtils.extend(state.app, changes.app);
		
		if (changes.entities) updateEntities(state.entities, changes.entities);
		if (changes.texts) updateTexts(changes.texts);
		if (changes.threads) updateThreads(changes.threads);
		if(changes.user) updateCurrentUser(changes.user);
		next();
	}, 1000);
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
			console.log(roomId);
		}
	});
}

function updateCurrentUser(user) {
	state.user = user;
}

function updateTexts(texts) {
	var rooms = Object.keys(texts), ranges;
	
	rooms.forEach(function(roomThread) {
		ranges = store.get("texts", roomThread);
		if(!ranges) ranges = state.texts[roomThread] = [];
		if(texts[roomThread].length) {
			texts[roomThread].forEach(function(newRange) {
				state.texts[roomThread] = rangeOps.merge(ranges, newRange, "time");
			});
		} else {
			console.log(roomThread);
		}
	});
}

function buildIndex(obj) {
	var relation;

	obj.indexes = {
		userRooms: {},
		roomUsers: {}
	};
	if(obj.entities){
		for (var name in obj.entities) {
			relation = obj.entities[name];
			if (relation && relation.room && relation.user) {
				(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
				(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
			}
		}
	}
	
}

function updateEntities(stateEntities, changesEntities) {
	objUtils.extend(stateEntities, changesEntities);
	buildIndex(state);
}

/*function updateIndex(type, ranges) {
	ranges.forEach(function(r) {
		var index = store.indexes[type + "ById"] = store.indexes[type + "ById"] || {};
		r.items.forEach(function(item) {
			index[item.id] = item;
		});
	});
}*/