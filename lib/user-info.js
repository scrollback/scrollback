"use strict";

function UserInfo(userId) {
	// Handle situation where called without "new" keyword
	if (false === (this instanceof UserInfo)) {
		throw new Error("Must be initialized before use");
	}

	if (typeof userId !== "string") {
		throw new TypeError("user id must be a string");
	}

	this.id = userId;
}

UserInfo.prototype.getNick = function() {
	var nick = (typeof this.id === "string") ? this.id.replace(/^guest-/, "") : "";

	return nick;
};

UserInfo.prototype.isGuest = function() {
	return (/^guest-/.test(this.id));
};

module.exports = UserInfo;
