"use strict";
var permissionLevels = require('../permissionWeights.js');
var SbError = require('./../../lib/SbError.js');
var readActions = ["away", "back", "getTexts", "getThreads"];
var writeActions = ["text", "edit"];

module.exports = function() {
	return function(action) {
		var guides = action.room.guides, readLevel, writeLevel;
		if (readActions.indexOf(action.type)>=0) {
			readLevel = (guides && guides.authorizer && typeof guides.authorizer.readLevel) ? guides.authorizer.readLevel : "guest";
			if (permissionLevels[readLevel] > permissionLevels[action.user.role]){
				return (new SbError('ERR_NOT_ALLOWED', {
					source: 'authorizer',
					action: action.type,
					requiredRole: readLevel,
					currentRole: action.user.role
				}));
			}
		} else if (writeActions.indexOf(action.type)>=0) {
			writeLevel = (guides && guides.authorizer && typeof guides.authorizer.writeLevel) ? guides.authorizer.writeLevel : "guest";
			console.log(writeLevel, action.user.role, permissionLevels[writeLevel] > permissionLevels[action.user.role]);
			if (permissionLevels[writeLevel] > permissionLevels[action.user.role]){
				
				console.log("throwing error.............................");
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
