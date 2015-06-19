"use strict";

var core, store;
var queueBack = [];
//var entityOps = require("./../entity-ops.js");

var UserInfo = require("./../../lib/user-info.js");

module.exports = function(c, conf, s) {

	core = c;
	store = s;

	core.on("setstate", function(changes, next) {
		if (changes.nav && changes.nav.room) {
			sendBack(changes.nav.room);
		}
		next();
	}, 998);

	core.on("statechange", function(changes, next) {
		if (changes.app && changes.app.connectionStatus) {
			if (changes.app.connectionStatus === "offline") {
				changes.app.listeningTo = null;
			} else if (changes.app.connectionStatus === "online") {
				while (queueBack.length) enter(queueBack.splice(0, 1)[0]);
			}
		}
		next();
	}, 500);

	core.on("init-dn", function(init, next) {
		var entities = {};
		init.occupantOf.forEach(function(roomObj) {
			if(init.old && init.old.id){
				if(new UserInfo(init.old.id).isGuest()) {
					entities[init.old.id] = null;
					entities[roomObj.id + "_" + init.old.id] = null;
				}else {
					entities[roomObj.id + "_" + init.old.id] = {
						statue : "offline"
					};
				}
			}
			sendBack(roomObj.id);
		});

		init.memberOf.forEach(function(roomObj) {
			sendBack(roomObj.id);
		});

		next();
	}, 500);
};

function enter(roomId) {
	core.emit("back-up", {
		to: roomId
	});
}

function sendBack(roomId) {
	var listeningRooms = store.get("app", "listeningRooms");
	if (listeningRooms.indexOf(roomId) < 0) {
		if (store.get("app", "connectionStatus") === "online") {
			enter(roomId);
		} else {
			queueBack.push(roomId);
		}
	}
}
