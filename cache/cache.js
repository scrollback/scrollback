"use strict";
var sessionCache = {}, roomCache = {};

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

	core.on("getRooms", function(query, next) {
		var room;

		if (query.ref && !query.hasMember && !query.hasOccupant) {
			room = roomCache[query.ref];
			if (room) query.results = [ room ];
		}
		process.nextTick(function() {
			return next();
		});
	}, 400);

	core.on("getRooms", function(query, next) {
		var room;
		if (query.ref && !query.hasMember && !query.hasOccupant && query.results && query.results.length) {
			roomCache[query.ref] = query.results[0];
			if (room) query.results = [ room ];
		}
		process.nextTick(function() {
			return next();
		});
	}, 1);

	[ "init", "user" ].forEach(function(event) {
		core.on(event, function (action, next) {
			if (action.user && action.user.id) sessionCache[action.user.id] = action.user;
			return next();
		}, 1);
	});
};
