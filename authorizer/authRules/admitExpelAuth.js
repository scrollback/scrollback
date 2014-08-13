/* jshint node:true */
var permissionWeights = require('../permissionWeights.js');
var SbError = require('../../lib/SbError.js');

function checkAuthority(action) {
	var openFollow = action.room.guides.authorizer && action.room.guides.authorizer.openFollow;
	if (typeof openFollow === "undefined") {
		openFollow = true;
	}

	if (openFollow && action.user.role === "follower" && action.role === action.user.role) {
		return true;
	}
	// prevent people from manipulating roles above them
	if (action.user.role === "owner") {
		return true; // owners have authority to create all roles including other owners.
	}
	if (permissionWeights[action.victim.role] >= permissionWeights[action.user.role] ||
		permissionWeights[action.role] >= permissionWeights[action.user.role]) {
		throw new SbError('ERR_NOT_ALLOWED', {
			id: action.id,
			currentRole: action.user.role,
			action: action.type
		});
	} else {
		return true;
	}
}

function checkConsent(action) {
	if (permissionWeights[action.role] < permissionWeights[action.victim.role]) {
		return true;
	} else if (action.role === action.victim.transitionRole && action.user.transitionType === "request") {
		return true;
	} else {
		action.transitionRole = action.role;
		action.transitionType = "invite";
		delete action.role;
		return true;
	}
}

function admitExpel(action, callback) {
	if (permissionWeights[action.user.role] <= permissionWeights.guest) {
		// guest or below cannot follow rooms!
		return callback(new SbError("ERR_NOT_ALLOWED"));
	}

	if (action.transitionTime) {
		action.transitionType = 'timeout';
		if (!action.transitionRole) {
			action.transitionRole = action.user.role;
		}
	}
	try {
		if (checkAuthority(action) && checkConsent(action)) {
			return callback();
		}
	} catch (e) {
		return callback(e);
	}

}

module.exports = function (core) {

	core.on('admit', function (admit, callback) {
		if (!admit.role) {
			admit.role = "follower";
		}
		return admitExpel(admit, callback);
	}, "authorization");

	core.on('expel', function (expel, callback) {
		if (!expel.role) {
			expel.role = "none";
		}
		return admitExpel(expel, callback);
	}, "authorization");

};