/* jshint node:true */
/*jshint strict: true*/
var permissionWeights = require('../permissionWeights.js');
var SbError = require('../../lib/SbError.js');
var domainCheck;
function checkAuthority(action) {
	"use strict";
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
	"use strict";
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
	"use strict";
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

module.exports = function (core, config) {
	"use strict";
	domainCheck = require("../domain-auth.js")(core, config);
	core.on('admit', function (admit, callback) {
		if(!domainCheck(admit.room, admit.origin)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));
		/*This is hacky code, rewite it.*/
		if (admit.user.role === 'owner' || admit.user.role === 'su') {
			 return callback();
		} else {
			return callback(new Error("ERR_NOT_ALLOWED"));
		}
		//log.d("Admit: ", JSON.stringify(admit));
		if (!admit.role) {
			admit.role = "follower";
		}
		return admitExpel(admit, callback);
	}, "authorization");

	core.on('expel', function (expel, callback) {
		if(!domainCheck(expel.room, expel.origin)) return callback(new SbError("AUTH:DOMAIN_MISMATCH"));
		if (!expel.role) {
			expel.role = "none";
		}
		return admitExpel(expel, callback);
	}, "authorization");

};
