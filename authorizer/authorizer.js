var events = ["text", "edit", "away", "back", "join", "part", "admit", "expel", "getTexts", "getThreads"];
var domainAuth;
var userOps = require("../lib/user.js");
var SbError = require('./../lib/SbError.js');
var readPermissionRules;
var customHandlers = {
	
};
module.exports = function(core, config) {
	domainAuth = require("./rules/domainRules.js")(core, config);
	permissionRules = require("./rules/permissionRules.js")(core, config);
	relationshipRules = require("./rules/relationshipRules.js")(core, config);
	events.forEach(function(event) {
		core.on(event, function(action, next) {
			var error;
			if (!userOps.isWebSession(action.session)) return next();

			error = domainAuth(action);
			if(error) return next(error);
			error = permissionRules(action);
			if(error) return next(error);
			error = relationshipRules(action);
			if(error) return next(error);
		}, "authorization");
	});
};
