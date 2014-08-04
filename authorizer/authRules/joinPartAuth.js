var SbError = require('../../lib/SbError.js');
module.exports = function (core) {
	core.on('join', function (action, callback) {
		if (!action.user.role || action.user.role === "none") {
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
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'join',
			requiredRole: 'registered',
			currentRole: action.user.role
		}));
		if (action.user.role === "owner") return callback(); // owner can switch to any role
		else if (action.user.role === "registered" && action.role === "follower") {
			if (action.room.guides.openFollow) {
				return callback();
			} else {
				action.transitionRole = "follower";
				action.transitonType = "request";
				action.role = "registered";
				return callback();
			}
		} else {
			// allow user to join if he has been invited
			if (action.role === "follower" && action.user.transitionRole === "follower" && action.user.transitionType === "invite") {
				return callback();
			} else {
				action.transitionRole = "follower";
				action.transitonType = "request";
				action.role = "none";
				return callback();
			}

		}
	}, "authorization");
};