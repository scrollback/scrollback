"use strict";

module.exports = {
	isInternalSession: function(session) {
		return (/^internal/.test(session));
	},

	isWebSession: function(session) {
		return (/^web/.test(session));
	},

	isIRCSession: function(session) {
		return /^irc:/.test(session);
	}
};
