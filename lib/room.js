/**
 * Methods related to the room object
 */

"use strict";

var permissionWeights = require("../authorizer/permissionWeights.js");

module.exports = function(core, config, store) {
	var user = require("./user.js")(core, config, store);

	return {
		follow: function(roomId) {
			core.emit("join-up", { to: roomId });
		},

		unFollow: function(roomId) {
			core.emit("part-up", { to: roomId });
		},

		toggleFollow: function(roomId, userId) {
			var rel = store.getRelation(roomId, userId);

			if (rel && rel.role === "follower") {
				this.follow();
			} else {
				this.unFollow();
			}
		},

		isReadable: function(roomId, userId) {
			var roomObj = store.getRoom(),
				readLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
							 roomObj.guides.authorizer.readLevel) ? roomObj.guides.authorizer.readLevel : "guest";

			return (permissionWeights[user.getRole(userId, roomId)] >= permissionWeights[readLevel]);
		},

		isWritable: function(roomId, userId) {
			var roomObj = store.getRoom(),
				writeLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
							  roomObj.guides.authorizer.writeLevel) ? roomObj.guides.authorizer.writeLevel : "guest";

			return (permissionWeights[user.getRole(userId, roomId)] >= permissionWeights[writeLevel]);
		}
	};
};
