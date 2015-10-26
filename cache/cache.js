"use strict";
var log = require("../lib/logger.js"), sessionCache = {}, roomCache = {};

module.exports = function(core) {
	core.on("getUsers", function(query) {
		var session;

		if (query.ref && query.ref === "me" && !query.memberOf && !query.occupantOf && !/\*$/.test(query.ref)) {
			session = sessionCache[query.session];
			log.d("handling ref query.", query, session);
			if (session) {
				query.results = [ session ];
			}
		}
	}, 400);

	core.on("getRooms", function(query) {
		var room;

		if (query.ref && !query.hasMember && !query.hasOccupant  && !/\*$/.test(query.ref)) {
			room = roomCache[query.ref];
			if (room) {
				query.results = [ room ];
			}
		}
	}, 400);

	core.on("getRooms", function(query) {
		if (query.ref && !query.hasMember && !query.hasOccupant && query.results && query.results.length) {
			roomCache[query.ref] = query.results[0];
		}
	}, 1);

	core.on("away", function(action) {
		setTimeout(function() {
			delete sessionCache[action.session];
			log.d("deleting session.", action.session);
		}, 16000);
	}, 1);

	[ "init", "user" ].forEach(function(event) {
		core.on(event, function (action) {
			log.d("cache update: session", action.session);
			if (action.session) sessionCache[action.session] = action.user;
		}, 1);
	});
};
