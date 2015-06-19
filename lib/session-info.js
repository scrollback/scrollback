"use strict";

function SessionInfo(session) {
	// Handle situation where called without "new" keyword
	if (false === (this instanceof SessionInfo)) {
		throw new Error("Must be initialized before use");
	}

	if (typeof session !== "string") {
		throw new TypeError("session must be a string");
	}

	this.session = session;
}

SessionInfo.prototype.isInternal = function() {
	return (/^internal/.test(this.session));
};

SessionInfo.prototype.isWeb = function() {
	return (/^web/.test(this.session));
};

SessionInfo.prototype.isIRC = function() {
	return (/^irc:/.test(this.session));
};

module.exports = SessionInfo;
