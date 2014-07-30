var SbError = require('../../lib/SbError.js');
module.exports = function (core) {
	core.on('admit', function (action, callback) {
		if (action.room.guides.authorizer && action.room.guides.authorizer.openFollow === undefined) {
			action.room.guides.authorizer.openFollow = true;
		}
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'admit',
			requiredRole: 'moderator',
			currentRole: action.user.role
		}));
		else if (action.user.role === "owner" || action.user.role === "su") return callback();
		else if (action.user.role === "moderator" && action.victim.invitedRole !== "owner" && action.victim.invitedRole !== "moderator") return callback();
		else if (action.user.role === "follower" && action.victim.role === "registered" && action.room.guides.authorizer.openFollow) return callback();
		else if (action.user.role !== "gagged" && action.user.role !== "banned" && action.user.role !== "registered" && action.user.role !== "guest") {
			if (action.victim.requestedRole && action.victim.requestedRole === action.user.role) return callback();
			else {
				action.victim.invitedRole = action.user.role;
				return callback();
			}
		} else {
			return callback(new SbError('ERR_NOT_ALLOWED', {
				source: 'authorizer',
				action: 'admit',
				requiredRole: 'moderator',
				currentRole: action.user.role
			}));
		}
	}, "authorization");

	core.on('expel', function (action, callback) {
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'expel',
			requiredRole: 'moderator',
			currentRole: action.user.role
		}));
		if (action.user.role === "owner" || action.user.role === "su") return callback();
		else if (action.user.role === "moderator" && action.victim.role !== "moderator" && action.victim.role !== "owner") {
			return callback();
		}
		return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'expel',
			requiredRole: 'moderator',
			currentRole: action.user.role
		}));
	}, "authorization");
};