var SbError = require('../../lib/SbError.js');
module.exports = function (core) {
	core.on('join', function (action, callback) {
		if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (!action.room.guides) action.room.guides = {
			openFollow: true
		};
		if (!action.room.guides.openFollow) action.room.guides.openFollow = true;
		if (!action.user.role) action.user.role = "registered";
		if (!action.user.requestedRole) action.user.requestedRole = "";
		if (!action.user.invitedRole) action.user.invitedRole = "";
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'join',
			requiredRole: 'registered',
			currentRole: action.user.role
		}));
		if (action.user.role === "owner") return callback(); // owner can switch to any role
		else if (action.user.role === "moderator" && action.user.requestedRole !== "owner") return callback();
		else if (action.user.role === "registered" && action.room.guides.openFollow) return callback();
		else if (action.user.role === "registered" && action.user.requestedRole === "follower") {
			if (action.room.guides.openFollow) {
				return callback();
			} else {
				action.user.requestedRole = "follow_requested";
				return callback();
			}
		} else {
			if (action.user.role === action.user.invitedRole) return callback();
			else return callback(new SbError('ERR_NOT_ALLOWED', {
				source: 'authorizer',
				action: 'join',
				requiredRole: action.user.invitedRole,
				currentRole: action.user.role
			}));
		}
	}, "authorization");
};