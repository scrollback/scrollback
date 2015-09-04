"use strict";

var relationsProps = require("./../property-list.js").relations;
var core, store;


function constructEntitiesFromUserList(list, entities, roomId) {
	list.forEach(function(e) {
		var relation;

		if (entities[roomId + "_" + e.id]) {
			relation = entities[roomId + "_" + e.id];
		} else {
			relation = {};
		}

		relation.room = roomId;
		relation.user = e.id;
		relation.status = "offline";
		relationsProps.forEach(function(key) {
			if (e[key]) {
				relation[key] = e[key];
				delete e[key];
			}
		});

		entities[e.id] = e;
		entities[roomId + "_" + e.id] = relation;
	});
}

function loadUsersList(roomId) {
	var occupantList, memberList, done = false,
		entities = {};

	function emitSetState() {
		constructEntitiesFromUserList(memberList, entities, roomId);
		constructEntitiesFromUserList(occupantList, entities, roomId);

		occupantList.forEach(function(e) {
			entities[roomId + "_" + e.id].status = "online";
		});

		core.emit("setstate", { entities: entities });
	}

	core.emit("getUsers", {
		type: "getUsers",
		memberOf: roomId
	}, function(err, data) {
		memberList = data.results || [];

		if (!done) {
			done = true;
		} else {
			emitSetState();
		}
	});

	core.emit("getUsers", {
		type: "getUsers",
		occupantOf: roomId
	}, function(err, data) {
		occupantList = data.results || [];

		if (!done) {
			done = true;
		} else {
			emitSetState();
		}
	});
}

module.exports = function(c, conf, s) {
	core = c;
	store = s;

	core.on("setstate", function(changes) {
		var roomId = store.with(changes).get("nav", "room"),
			oldRoomId = store.get("nav", "room");

		if (!changes.entities) changes.entities = {};

		if (roomId && roomId !== oldRoomId) {
			loadUsersList(roomId);
		}
	}, 850);
};
