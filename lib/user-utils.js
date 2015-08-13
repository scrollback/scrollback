"use strict";

module.exports = {
	getNick: function(userId) {
		var nick = (typeof userId === "string") ? userId.replace(/^guest-/, "") : "";

		return nick;
	},

	isGuest: function(userId) {
		return (/^guest-/.test(userId));
	}
};
