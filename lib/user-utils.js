"use strict";

module.exports = {
	getNick: function(userId) {
		var nick = (typeof userId === "string") ? userId.replace(/^guest-/, "") : "";

		return nick;
	},

	getPicture: function(userId, size) {
		return "/i/" + userId + "/picture?size=" + (size || 256);
	},

	isGuest: function(userId) {
		return (/^guest-/.test(userId));
	}
};
