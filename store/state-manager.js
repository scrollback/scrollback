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
		next();
	}, 1000);
};

function updateTexts(texts) {
	var rooms = Object.keys(texts), ranges;
	rooms.forEach(function(room) {
		var threads = Object.keys(room.textRanges);
		threads.forEach(function(thread) {
			ranges = store.get("texts", room, thread);
			if(!ranges) ranges = store.texts[room][thread] = [];
			texts.textRanges[thread].forEach(function(newRange) {
				rangeOps.merge(ranges, newRange, "time");
			});
		});
	});
}

function buildIndex(obj) {
	var relation;

	obj.indexes = {
		userRooms: {},
		roomUsers: {}
	};

	for (var name in obj.entities) {
		relation = obj.entities[name];

		if (relation.room && relation.user) {
			(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
			(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
		}
	}
}

function updateEntities(stateEntities, changesEntities) {
	objUtils.extend(stateEntities, changesEntities);
	buildIndex(state);
	/*var ids = Object.keys(entities);
	var roomuser;
	ids.forEach(function(id) {
		if (entities[id] === null) {
			delete store.entities[id];
		} else {
			state.entities[id] = clone(entities[id]);
			delete state.entities[id].role;
			//TODO: also delete other properties regarding membership.
		}
	});*/
}

/*
function updateContent(content) {
	var rooms = Object.keys(content);
	rooms.forEach(function(e) {
		if (content[e].textRanges) {
			updateIndex("text", content[e].textRanges);
			rangeOps(e, content[e].textRanges);
		}
		if (content[e].threadRanges) {
			updateIndex("thread", content[e].textRanges);
			rangeOps(e, content[e].threadRanges);
		}
	});
}
*/

/*function updateIndex(type, ranges) {
	ranges.forEach(function(r) {
		var index = store.indexes[type + "ById"] = store.indexes[type + "ById"] || {};
		r.items.forEach(function(item) {
			index[item.id] = item;
		});
	});
}*/