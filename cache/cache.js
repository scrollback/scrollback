"use strict";
var log = require("../lib/logger.js"), sessionCache = {}, roomCache = {};

module.exports = function(core) {
	core.on("getUsers", function(query, next) {
		var session;
		if (query.ref && query.ref === "me" && !query.hasMember && !query.hasOccupant) {
			session = sessionCache[query.session];
			log.d("handling ref query.", query, session);
			if (session) {
				query.results = [ session ];
			}
		}

		process.nextTick(function() {
			return next();
		});
	}, 400);

	core.on("getRooms", function(query, next) {
		var room;

		if (query.ref && !query.hasMember && !query.hasOccupant) {
			room = roomCache[query.ref];
			if (room) {
				query.results = [ room ];
			}
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

	core.on("away", function(action, next) {
		setTimeout(function() {
			delete sessionCache[action.session];
			log.d("deleting session.", action.session);
		}, 16000);
		next();
	}, 1);

	[ "init", "user" ].forEach(function(event) {
		core.on(event, function (action, next) {
			log.d("cache update: session", action.session);
			if (action.session) sessionCache[action.session] = action.user;
			return next();
		}, 1);
	});
};
