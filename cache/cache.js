"use strict";
var sessionCache = {};

module.exports = function(core) {
	core.on("getUsers", function(query, next) {
		var session;

		if (query.ref && query.ref === "me") {
			session = sessionCache[query.session];
			if (session) query.results = [ session ];
		}
		process.nextTick(function() {
			return next();
		});
	}, 400);

	[ "init", "user" ].forEach(function(event) {
		core.on(event, function (action, next) {
			if (action.user && action.user.id) sessionCache[action.user.id] = action.user;
			return next();
		});
	});
};
