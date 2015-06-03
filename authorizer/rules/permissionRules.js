"use strict";

var permissionLevels = require("../permissionWeights.js"),
	SbError = require("./../../lib/SbError.js"),
	readActions = [ "away", "back", "getTexts", "getThreads"],
	writeActions = [ "text", "edit", "admit", "expel"];

module.exports = function() {
	return function(action) {
		var guides = action.room.guides,
			readLevel, writeLevel;

		if (readActions.indexOf(action.type) > -1) {
			readLevel = (guides && guides.authorizer && guides.authorizer.readLevel) ? guides.authorizer.readLevel : "guest";

			if (permissionLevels[readLevel] > permissionLevels[action.user.role]) {
				return (new SbError("ERR_NOT_ALLOWED", {
					source: "authorizer",
					action: action.type,
					requiredRole: readLevel,
					currentRole: action.user.role
				}));
			}
		}

		if (writeActions.indexOf(action.type) > -1) {
			writeLevel = (guides && guides.authorizer && guides.authorizer.writeLevel) ? guides.authorizer.writeLevel : "guest";

			if (permissionLevels[writeLevel] > permissionLevels[action.user.role]) {
				return (new SbError("ERR_NOT_ALLOWED", {
					source: "authorizer",
					action: action.type,
					requiredRole: writeLevel,
					currentRole: action.user.role
				}));
			}
		}
	};
};
