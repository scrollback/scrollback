/* jshint browser: true */

var listenersAdded;

module.exports = function(core, config, store) {
	var validateEntity = require("./validate-entity.js")(core, config, store),
		roomError = "We could not create the room. Please refresh the page and try again.",
		userError = "We could not create your account. Please refresh the page and try again.",
		roomCallback, userCallback;

	function createEntity(type, name, callback) {
		if (typeof callback !== "function") {
			callback = function() {};
		}

		if (type === "room") {
			validateEntity("Room", name, function(res, name) {
				var room, roomObj, newRoom, identities, context,
					nav = store.get("nav");

				if (res === "wait") {
					return callback("wait");
				}

				if (res === "error") {
					return callback("error", name || roomError);
				}

				if (res === "ok") {
					room = store.get("nav", "room");
					roomObj = store.getRoom(room);

					if (nav.dialogState && nav.dialogState.roomIdentity) {
						identities = [ nav.dialogState.roomIdentity ];
					} else {
						identities = [];
					}

					newRoom = {
						id: name,
						description: "",
						params: {},
						guides: {},
						identities: identities
					};

					if (room) {
						newRoom.guides = roomObj.guides || {};
					}
					if (identities) {
						context = store.get("context");

						if (context.embed) {
							newRoom.guides.allowedDomains = [context.embed.origin.host];
						}
					}

					core.emit("room-up", {
						to: name,
						room: newRoom
					}, function(err, action) {
						if (err) {
							return callback("error", roomError);
						}

						roomCallback = {};
						roomCallback[action.id] = {
							room: name,
							callback: callback
						};
					});
				}
			});
		} else if (type === "user") {
			validateEntity("User", name, function(res, name) {
				var userObj;

				if (res === "wait") {
					return callback("wait");
				}

				if (res === "error") {
					return callback("error", name || userError);
				}

				if (res === "ok") {
					userObj = store.getUser();

					if (!name || !userObj || !userObj.identities) {
						return callback("error", userError);
					}

					core.emit("user-up", {
						from: name,
						to: name,
						user: {
							id: name,
							identities: userObj.identities,
							picture: userObj.picture,
							params: {
								pictures: userObj.params.pictures
							},
							guides: {}
						}
					}, function(err, action) {
						if (err) {
							return callback("error", userError);
						}

						userCallback = {};
						userCallback[action.id] = {
							user: name,
							callback: callback
						};
					});
				}
			});
		}
	}

	if (!listenersAdded) {
		core.on("user-dn", function(action, next) {
			if (userCallback) {
				for (var id in userCallback) {
					if (userCallback[id] && userCallback[id].user === action.user.id) {
						userCallback[id].callback("ok");
					}
				}
			}

			userCallback = null;

			next();
		}, 100);

		core.on("room-dn", function(action, next) {
			if (roomCallback) {
				for (var id in roomCallback) {
					if (roomCallback[id] && roomCallback[id].room === action.room.id) {
						roomCallback[id].callback("ok");
					}
				}
			}

			roomCallback = null;

			next();
		}, 100);

		core.on("error-dn", function(err, next) {
			if (userCallback && err.id in userCallback) {
				userCallback[err.id].callback("error", userError);

				userCallback = null;
			}

			if (roomCallback && err.id in roomCallback) {
				roomCallback[err.id].callback("error", roomError);

				roomCallback = null;
			}

			next();
		}, 100);

		listenersAdded = true;
	}

	return createEntity;
};
