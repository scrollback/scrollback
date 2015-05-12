"use strict";
var SbError = require('../../lib/SbError.js');
var utils = require('../../lib/app-utils.js');
var domainCheck;
module.exports = function (core, config) {
	domainCheck = require("../domain-auth.js")(core, config);
	core.on('edit', function (action, callback) {
		if(!utils.isIRCSession(action.session) && !domainCheck(action.room, action.origin)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));
		if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'edit',
			requiredRole: 'moderator',
			currentRole: action.user.role
		}));
		if (action.user.role === "moderator" || action.user.role === "owner" || action.user.role === "su") return callback();
		return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'edit',
			requiredRole: 'moderator',
			currentRole: action.user.role
		}));
	}, "authorization");
};
