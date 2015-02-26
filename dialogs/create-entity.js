/* jshint browser: true */

var validateEntity = require("./validate-entity.js");

module.exports = function(core, config, store) {
	function createEntity(type, name, callback) {
		if (typeof callback === "function") {
			callback = function() {};
		}

		if (type === "room") {
			validateEntity("Room", name, function(res, name) {
				var errormessage = "We could not create the room. Please refresh the page and try again.",
					room, roomObj, newRoom;

				if (res === "wait") {
					return callback("wait");
				}

				if (res === "error") {
					return callback("error", name || errormessage);
				}

				if (res === "ok") {
					room = store.getNav().room;
					roomObj = store.getRoom(room);
					newRoom = {
						id: name,
						description: "",
						params: {},
						guides: {},
						identities:[]
					};

					if (room) {
						newRoom.guides = roomObj.guides || {};
						newRoom.identities = roomObj.identities || [];
					}

					core.emit("room-up", {
						to: name,
						room: newRoom
					}, function(err) {
						if (err) {
							return callback("error", errormessage);
						}
					});
				}
			});
		} else if (type === "user") {
			validateEntity("User", function(res, name) {
				var errormessage = "We could not create your account. Please refresh the page and try again.",
					userObj;

				if (res === "wait") {
					return callback("wait");
				}

				if (res === "error") {
					return callback("error", name || errormessage);
				}

				if (res === "ok") {
					userObj = store.getUser();

					if (!name || !userObj || !userObj.identities) {
						return callback("error", errormessage);
					}

					core.emit("user-up", {
						user: {
							id: name,
							identities: userObj.identities,
							picture: userObj.picture,
							params: {
								pictures: userObj.params.pictures
							},
							guides: {}
						}
					}, function(err) {
						if (err) {
							return callback("error", errormessage);
						}
					});
				}
			});
		}
	}

	return createEntity;
};
