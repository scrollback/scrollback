var permissionLevels = require('../permissionWeights.js');
var SbError = require('./../../lib/SbError.js');
var readActions = ["away", "back", "getTexts", "getThreads"];
var writeActions = ["text", "edit"];

var roleWeights = {
	banned: -2,
	gagged: -1,
	guest: 0,
	registered: 1,
	none: 1,
	follower: 2,
	moderator: 3,
	owner: 4,
	su: 5
};

module.exports = function(core, config) {
	return function(action) {
		var guides = action.room.guides,
			readLevel;
		
		if (readActions.indexOf(action.type)) {
			readLevel = (guides && guides.authorizer && typeof guides.authorizer.readLevel) ? guides.authorizer.readLevel : "guest";
			if (permissionLevels[readLevel] > permissionLevels[action.user.role]){
				return (new SbError('ERR_NOT_ALLOWED', {
					source: 'authorizer',
					action: action.type,
					requiredRole: readLevel,
					currentRole: action.user.role
				}));
			}
		} else if (writeActions.indexOf(action.type)) {
			writeLevel = (guides && guides.authorizer && typeof guides.authorizer.writeLevel) ? guides.authorizer.writeLevel : "guest";
			if (permissionLevels[writeLevel] > permissionLevels[action.user.role]){
				return (new SbError('ERR_NOT_ALLOWED', {
					source: 'authorizer',
					action: action.type,
					requiredRole: writeLevel,
					currentRole: action.user.role
				}));
			}
		}
	};
};
