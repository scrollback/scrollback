"use strict";
var permissionWeights = require('../permissionWeights.js');
var SbError = require('./../../lib/SbError.js');
var log = require('../../lib/logger.js');

var handlers = {
	join: function(action) {
		var openRoom = action.room.guides.authorizer.openRoom;
		if (!action.role) action.role = "follower";

		if (action.user.role === action.role) {
			return (new SbError("YOU_ARE_ALREADY_" + action.role.toUpperCase(), {
				source: 'authorizer',
				action: action.type
			}));
		}

		if (permissionWeights[action.user.role] === permissionWeights.owner) {
			return (new SbError("OWNER_CANT_CHANGE_ROLE", {
				source: 'authorizer',
				action: action.type
			}));
		}
		if (!openRoom || permissionWeights[action.role] > permissionWeights.follower) {
			action.transitionType = "request";
			action.transitionRole = action.role;
			delete action.role;
		}
	},

	part: function(action) {
		if (permissionWeights[action.user.role] === permissionWeights.owner) {
			return (new SbError("OWNER_CANT_PART", {
				source: 'authorizer',
				action: action.type
			}));
		}

		if (permissionWeights[action.user.role] < permissionWeights.follower) {
			return (new SbError("NOT_A_FOLLOWER", {
				source: 'authorizer',
				action: action.type
			}));
		}

		action.role = "none";
	},

	admit: admitExpel,
	expel: admitExpel
};


function admitExpel (action	) {
	log.d("victim:", action.victim);
	if (permissionWeights[action.user.role] < permissionWeights.moderator) {
		return (new SbError("ERR_NOT_ALLOWED", {
			source: 'authorizer',
			action: action.type,
			requiredRole: "moderator",
			currentRole: action.user.role
		}));
	}

	if (action.role && permissionWeights[action.role] >= permissionWeights[action.user.role] && action.user.role != "owner") {
		return (new SbError("ERR_NOT_ALLOWED", {
			source: 'authorizer',
			action: action.type,
			requiredRole: action.role,
			currentRole: action.user.role
		}));
	}
	
	if (action.victim.transitionType === "request") {
		if (permissionWeights[action.victim.transitionRole] > permissionWeights[action.user.role]) {
			return (new SbError("ERR_NOT_ALLOWED", {
				source: 'authorizer',
				action: action.type,
				requiredRole: action.victim.transitionRole,
				currentRole: action.user.role
			}));
		}
		
		if (!action.role) action.role = action.transitionRole;
		action.transitionType = null;
		action.transitionRole = null;
	} else {
		if (permissionWeights[action.victim.role] >= permissionWeights[action.user.role]) {
			return (new SbError("ERR_NOT_ALLOWED", {
				source: 'authorizer',
				action: action.type,
				requiredRole: action.victim.role,
				currentRole: action.user.role
			}));
		}
		action.role = action.role?action.role : "follower";
		if (permissionWeights[action.role] >= permissionWeights.follower) {
			action.transitionRole = action.role;
			action.transitionType = "invite";
			delete action.role;
		}
	}
	log.d("Relationship action:", action);
}

module.exports = function() {
	return function(action) {
		if(!handlers[action.type]) return;
		if (permissionWeights[action.user.role] <= permissionWeights.guest || permissionWeights[action.role] > permissionWeights.owner) {
			return (new SbError("ERR_NOT_ALLOWED", {
				source: 'authorizer',
				action: action.type,
				requiredRole: "registered",
				currentRole: action.user.role
			}));
		}
		setOpenRoom(action.room);
		return handlers[action.type](action);
	};
};


function setOpenRoom(room) {
	if (!room.guides) room.guides = {};
	if (!room.guides.authorizer) room.guides.authorizer = {};
	room.guides.authorizer.openRoom = (room.guides.authorizer && typeof room.guides.authorizer.openRoom === "boolean") ? room.guides.authorizer.openRoom : true;
}
