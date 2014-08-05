var permissionWeights = require('../permissionWeights.js');
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
		
		else if (action.role !== "owner" && action.role !== "moderator" && action.user.role === "moderator") {
			return callback();
		}
		
		else if (action.role === "follower" && action.user.role === "follower" && action.victim.role === "registered" && action.room.guides.authorizer.openFollow) {
			return callback();
		}
		
		else if (action.user.role === "moderator" || action.user.role === "owner") {
			if (permissionWeights[action.role] > permissionWeights[action.user.role]) {
				return callback();
			} else {
				action.user.transitionRole = action.user.role;
				action.user.transitionType = 'timeout';
				action.user.transitionTime = 60 * 60 * 1000; // 1 hour timeout for demotion ??
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
		else if (action.user.role === "moderator" && action.victim.role !== "moderator" && action.victim.role !== "owner" && 
				 action.role === "registered") {
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