"use strict";

var relationsProps = require("./../property-list.js").relations;
var core, config, store;


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
		entities = {},
		listeningRooms = store.get("app", "listeningRooms");

	listeningRooms = Array.isArray(listeningRooms) ? listeningRooms.slice(0) : [];

	if (listeningRooms.indexOf(roomId) < 0) {
		listeningRooms.push(roomId);
	}

	function emitSetState() {
		constructEntitiesFromUserList(memberList, entities, roomId);
		constructEntitiesFromUserList(occupantList, entities, roomId);
		occupantList.forEach(function(e) {
			entities[roomId + "_" + e.id].status = "online";
		});
		console.log( entities);
		core.emit("setstate", {
			entities: entities,
			app: {
				listeningRooms: listeningRooms
			}
		}, function(){
			console.log(arguments);
		});
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
	conf = config;
	store = s;

	core.on("setstate", function(changes) {
		var future = store.with(changes),
			roomId = future.get("nav", "room"),
			oldRoomId = store.get("nav", "room"),
			oldRelations = store.getRelatedUsers(roomId);


		if(!changes.entities) {
			changes.entities = {};
		}
		

		if (roomId && roomId !== oldRoomId) {
			oldRelations.forEach(function(rel) {
				changes.entities[roomId + "_" + rel.id] = null;
			});
			console.log("clear",changes);
			loadUsersList(roomId);
		}
		
		
	}, 850);
};
