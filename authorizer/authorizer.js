"use strict";	

var events = ["text", "edit", "away", "back", "join", "part", "admit", "expel", "getTexts", "getThreads"];
var userOps = require("../lib/user.js")();
module.exports = function(core, config) {
	var domainAuth = require("./rules/domainRules.js")(core, config);
	var permissionRules = require("./rules/permissionRules.js")(core, config);
	var relationshipRules = require("./rules/relationshipRules.js")(core, config);
	events.forEach(function(event) {
		core.on(event, function(action, next) {
			var error;
			if (!userOps.isWebSession(action.session)) return next();
			if (action.user.role === "none") {
				if (/^guest-/.test(action.user.id)) {
					action.user.role = "guest";
				} else {
					action.user.role = "registered";
				}
			}
			error = domainAuth(action);
			if(error) return next(error);
			error = permissionRules(action);
			if(error) return next(error);
			error = relationshipRules(action);
			if(error) return next(error);
			next();
		}, "authorization");
	});
	require("./authRules/initAuth.js")(core, config);
	require("./authRules/userAuth.js")(core, config);
	require("./authRules/roomAuth.js")(core, config);
	require("./authRules/queryAuth.js")(core, config);
	
};
