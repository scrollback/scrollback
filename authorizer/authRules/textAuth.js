var permissionLevels = require('../permissionWeights.js');
var SbError = require('../../lib/SbError.js');
module.exports = function (core) {
	core.on('text', function (action, callback) {
		if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (!/^web:/.test(action.session)) return callback();
		if (!action.room.guides || !action.room.guides.authorizer || !action.room.guides.authorizer.writeLevel) return callback();
		if (typeof action.room.guides.authorizer.writeLevel === 'undefined') action.room.guides.authorizer.writeLevel = 'guest';
		if (permissionLevels[action.room.guides.authorizer.writeLevel] <= permissionLevels[action.user.role]) return callback();
		//		else return callback(new Error('ERR_NOT_ALLOWED'));
		else return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'text',
			requiredRole: action.room.guides.authorizer.writeLevel,
			currentRole: action.user.role
		}));
	}, "authorization");
};