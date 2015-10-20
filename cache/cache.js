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
};
