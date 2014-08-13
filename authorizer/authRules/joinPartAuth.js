var permissionWeights = require('../permissionWeights.js');
var SbError = require('../../lib/SbError.js');
function joinPart(action, callback) {
	var openFollow = action.room.guides.authorizer && action.room.guides.authorizer.openFollow;
	if (typeof openFollow === "undefined") {
		openFollow = true;
	}
	
	if(permissionWeights[action.user.role] <= permissionWeights.guest) {
		// guest or below cannot follow rooms!
		return callback(new SbError("ERR_NOT_ALLOWED"));
	}
	
	if (permissionWeights[action.role] <= permissionWeights[action.user.role]) {
		// should moderators be allowed to downgrade by clicking on "follow" button ?
		return callback();
	} else if (action.role === "follower" && openFollow) {
		return callback();
	} else if (action.role === action.user.transitionRole && action.user.transitionType === "invite") {
		return callback();
	} else {
		action.transitionRole = action.role;
		action.transitionType = "request";
		delete action.role;
		return callback();
	}
}

module.exports = function (core) {
	core.on('join', function (join, callback) {
		if (!join.role) {
			join.role = "follower";
		}
		return joinPart(join, callback);
	}, "authorization");
	
	core.on('part', function (part, callback) {
		if (!part.role) {
			part.role = "none";
		}
		return joinPart(part, callback);
	}, "authorization");
};