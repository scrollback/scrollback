"use strict";

var SbError = require("../lib/SbError.js"),
	events = ["text", "edit", "away", "back", "join", "part", "admit", "expel", "getTexts", "getThreads"],
	userOps = require("../lib/user.js")();

module.exports = function(core, config) {
	var domainAuth = require("./rules/domainRules.js")(core, config),
		permissionRules = require("./rules/permissionRules.js")(core, config),
		relationshipRules = require("./rules/relationshipRules.js")(core, config);

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

	core.on("upload/getPolicy", function(action, next) {
		if (userOps.isGuest(action.user.id)) {
			next(new SbError("ERR_NOT_ALLOWED", {
				source: "authorizer",
				action: action.type,
				requiredRole: "registered",
				currentRole: "guest"
			}));
		} else {
			next();
		}
	},  "authorization");
};
