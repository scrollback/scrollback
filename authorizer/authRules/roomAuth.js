"use strict";
var SbError = require('../../lib/SbError.js');
var utils = require('../../lib/app-utils.js');
var domainCheck;
module.exports = function (core, config) {
	domainCheck = require("../rules/domainRules.js")(core, config);
	core.on('room', function (action, callback) {
		if(!utils.isInternalSession(action.session) && action.old && action.old.id && domainCheck(action)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));

		if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (action.user.role === 'su') return callback();
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'room',
			requiredRole: 'registered',
			currentRole: action.user.role
		}));
		if (action.user.role === "owner") return callback();
		if (!action.old || (typeof action.old === "object" && Object.keys(action.old).length === 0)) return callback();
		return callback(new SbError(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'room',
			requiredRole: 'owner',
			currentRole: action.user.role
		})));
	}, "authorization");
};
