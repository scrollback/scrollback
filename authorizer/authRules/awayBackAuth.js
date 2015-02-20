var SbError = require('../../lib/SbError.js');
var utils = require('../../lib/appUtils.js');
var permissionLevels = require('../permissionWeights.js');
var domainCheck;
module.exports = function (core, config) {
	domainCheck = require("../domain-auth.js")(core, config);
	core.on('back', function (action, callback) {
		if(!utils.isIRCSession(action.session) && !domainCheck(action.room, action.origin)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));
		if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (!action.room.guides || !action.room.guides.authorizer) {
			return callback();
		}
		if (!action.room.guides.authorizer.readLevel) return callback();
		if (!/^web:/.test(action.session)) return callback();

		if (permissionLevels[action.room.guides.authorizer.readLevel] <= permissionLevels[action.user.role]) return callback();
		else return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'back',
			requiredRole: action.room.guides.authorizer.readLevel,
			currentRole: action.user.role
		}));
	}, "authorization");
};