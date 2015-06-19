/**
 * Methods related to the user object
 */

"use strict";

module.exports = function(core, config, store) {
	return {
		getNick: function(userId) {
			var nick = (typeof userId === "string") ? userId.replace(/^guest-/, "") : "";

			return nick;
		},

		isGuest: function(userId) {
			return (/^guest-/.test(userId));
		},

		isInternalSession: function(session) {
			return (/^internal/.test(session));
		},

		isWebSession: function(session) {
			return (/^web/.test(session));
		},

		getRole: function(userId, roomId) {
			var rel = store.getRelation(roomId, userId),
				role;

			if (rel && rel.role && rel.role !== "none") {
				role = rel.role;
			} else {
				role = this.isGuest(userId) ? "guest" : "registered";
			}

			return role;
		},

		isAdmin: function(userId, roomId) {
			return /^(owner|moderator|su)$/.test(this.getRole(userId, roomId));
		}
	};
};
