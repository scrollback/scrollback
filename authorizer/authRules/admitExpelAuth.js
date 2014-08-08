/* jshint node:true */
var permissionWeights = require('../permissionWeights.js');
var SbError = require('../../lib/SbError.js');

function checkAuthority(action, callback) {
	var openFollow = action.room.guides.authorizer && action.user.guides.authorizer.openFollow;
	if (typeof openFollow === "undefined") {
		openFollow = true;
	}

	// prevent people from manipulating roles above them

	if (permissionWeights[action.victim.role] >= permissionWeights[action.user.role]) {
		callback(new SbError('ERR_NOT_ALLOWED', {
			id: action.id, 
			currentRole: action.user.role,
			action: action.type
		}));
		return false;
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

	if (action.transitionTime) {
		action.transitionType = 'timeout';
		if (!action.transitionRole) {
			action.transitionRole = action.user.role;
		}
	}

	if (checkAuthority(action, callback) && checkConsent(action)) {
		return callback();
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