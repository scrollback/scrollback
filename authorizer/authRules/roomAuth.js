var SbError = require('../../lib/SbError.js');
module.exports = function (core) {
	core.on('room', function (action, callback) {
		if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (action.user.role === 'su') return callback();
		if (action.user.role === "guest") return callback(new SbError({
			message: 'ERR_NOT_ALLOWED',
			info: {
				origin: "Authorizer",
				action: 'room',
				requiredRole: 'follower',
				currentRole: 'guest'
			}
		}));
		if (action.user.role === "owner") return callback();
		if (!action.old || (typeof action.old == "object" && Object.keys(action.old).length === 0)) return callback();
		return callback(new SbError({
			message: 'ERR_NOT_ALLOWED',
			info: {
				origin: "Authorizer",
				action: 'room',
				requiredRole: 'follower',
				currentRole: 'guest'
			}
		}));
	}, "authorization");
};