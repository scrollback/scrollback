"use strict";
var log = require("../lib/logger.js"), sessionCache = {}, roomCache = {};
var objectUtils = require("../lib/obj-utils.js");
module.exports = function(core) {
	core.on("getUsers", function(query) {
		var session;

		if (query.ref && query.ref === "me" && !query.memberOf && !query.occupantOf && !/\*$/.test(query.ref)) {
			session = sessionCache[query.session];
			log.d("handling ref query.", query, session);
			if (session) {
				query.results = [ objectUtils.clone(session) ];
			}
		}
	}, 400);

	core.on("getEntities", function(query) {
		var result;
		if (query.ref) {
			result = roomCache[query.ref];
			if (result) {
				query.results = [ objectUtils.clone(result) ];
			}
		}
	}, 400);

	core.on("getRooms", function(query) {
		var room;

		if (query.ref && !query.hasMember && !query.hasOccupant  && !/\*$/.test(query.ref)) {
			room = roomCache[query.ref];
			if (room) {
				query.results = [ objectUtils.clone(room) ];
			}
		}
	}, 400);

	core.on("getRooms", function(query) {
		if (query.ref && !query.hasMember && !query.hasOccupant && query.results && query.results.length) {
			roomCache[query.ref] = objectUtils.clone(query.results[0]);
		}
	}, 200);
	core.on("getEntities", function(query) {
		if (query.results) roomCache[query.ref] = objectUtils.clone(query.results[0]);
	}, 200);

	core.on("away", function(action) {
		setTimeout(function() {
			delete sessionCache[action.session];
			log.d("deleting session.", action.session);
		}, 16000);
	}, 1);

	[ "init", "user" ].forEach(function(event) {
		core.on(event, function (action) {
			log.d("cache update: session", action.session);
			if (action.session) sessionCache[action.session] = objectUtils.clone(action.user);
		}, 200);
	});
};
