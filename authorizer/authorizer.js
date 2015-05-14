/*
module.exports = function(core, config){
	require('./authRules/joinPartAuth.js')(core, config);
	require('./authRules/admitExpelAuth.js')(core, config);
	require('./authRules/awayBackAuth.js')(core, config);
	require('./authRules/textAuth.js')(core, config);
	require('./authRules/editAuth.js')(core, config);
	require('./authRules/roomAuth.js')(core, config);
	require('./authRules/userAuth.js')(core, config);
	require('./authRules/queryAuth.js')(core, config);
	require('./authRules/initAuth.js')(core, config);
};
*/

var events = ["text", "edit", "away", "back", "join", "part", "admit", "expel", "getTexts", "getThreads"];
var domainAuth;
var userOps = require("../lib/user.js");
var SbError = require('./../lib/SbError.js');
var readPermissionRules;

module.exports = function(core, config) {
	domainAuth = require("./rules/domainRules.js")(core, config);
	permissionRules = require("./rules/permissionRules.js")(core, config);
	relationshipRules = require("./rules/relationshipRules.js")(core, config);
	events.forEach(function(event) {
		core.on(event, function(action, next) {
			if (!userOps.isWebSession(action.session)) return next();

			if (!domainAuth(action)) return next(new SbError("AUTH:DOMAIN_MISMATCH", {
				source: 'authorizer',
				action: 'text'
			}));
			permissionLevels(action, function(err) {
				if(err) next(err);
			});
		}, "authorization");
	});
};
