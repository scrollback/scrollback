"use strict";

module.exports = function(core, config, store) {
	var userUtils = require("./../../lib/user-utils.js"),
		promisedAction = require("../../lib/promised-action.js")(core),
		permissionLevels = require("./../../authorizer/permissionWeights.js"),
		queueBack = [];

	function enter(roomId) {
		var room = store.getRoom(roomId),
			relation = store.getRelation(roomId),
			role = relation ? relation.role : "none";

		if ((room && room.guides && room.guides.authorizer && (permissionLevels[role] < permissionLevels[room.guides.authorizer.readLevel])) ||
		   (role === "banned")) {
			return;
		}

		promisedAction("back", { to: roomId }).then(() => {
			let listeningRooms = store.get("app", "listeningRooms");

			listeningRooms = Array.isArray(listeningRooms) ? listeningRooms.slice(0) : [];

			if (listeningRooms.indexOf(roomId) === -1) {
				listeningRooms.push(roomId);

				core.emit("setstate", {
					app: { listeningRooms }
				});
			}
		}).catch(() => {
			let listeningRooms = store.get("app", "listeningRooms");

			listeningRooms = Array.isArray(listeningRooms) ? listeningRooms.slice(0) : [];

			let index = listeningRooms.indexOf(roomId);

			if (index > -1) {
				listeningRooms.splice(index, 1);

				core.emit("setstate", {
					app: { listeningRooms }
				});
			}
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

	core.on("setstate", changes => {
		if (changes.app && changes.app.connectionStatus === "offline") {
			changes.app = changes.app || {};
			changes.app.listeningRooms = [];
		}

		if (changes.nav && changes.nav.room) {
			sendBack(changes.nav.room);
		}
	}, 998);

	core.on("statechange", function(changes, next) {
		if (changes.app && changes.app.connectionStatus) {
			if (changes.app.connectionStatus === "online") {
				while (queueBack.length) enter(queueBack.splice(0, 1)[0]);
			}
		}
		next();
	}, 500);

	core.on("init-dn", function(init, next) {
		var entities = {};

		init.occupantOf.forEach(function(roomObj) {
			if (init.old && init.old.id) {
				if (userUtils.isGuest(init.old.id)) {
					entities[init.old.id] = null;
					entities[roomObj.id + "_" + init.old.id] = null;
				}else {
					entities[roomObj.id + "_" + init.old.id] = {
						statue: "offline"
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
