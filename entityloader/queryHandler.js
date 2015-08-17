"use strict";
var sessionUtils = require("../lib/session-utils.js");
var log = require("../lib/logger.js");

var core, config, loadRelatedUser;
module.exports = function(c, conf) {
	core = c;
	config = conf;
	loadRelatedUser = require("./relatedUser.js")(core, config);

	function loadEntities(query, next) {
		var roomName = "";
		if (query.to) roomName = query.to;
		else if (query.memberOf) roomName = query.memberOf;
		else if (query.occupantOf) roomName = query.occupantOf;
		log.d("Entity loader received:", query);
		function done() {
			if (roomName) {
				core.emit("getRooms", {
					ref: roomName,
					session: "internal-loader"
				}, function(err, response) {
					if (err) return next(err);
					if (!response || !response.results || !response.results.length) return next(new Error("NO_ROOM_WITH_GIVEN_ID"));
					query.room = response.results[0];

					next();
				});
			} else {
				next();
			}
		}
		if (sessionUtils.isInternalSession(query.session)) {
			query.user = {
				id: "system",
				role: "owner"
			};
			done();
		} else {
			loadRelatedUser(roomName, "me", query.session, function(err, user) {
				if (err) return next(err);
				query.user = user;
				done();
			});
		}

	}

	core.on("getUsers", function(query, next) {
		if (query.ref === "me") return next();
		loadEntities(query, next);
	}, "loader");
	core.on("getRooms", loadEntities, "loader");
	core.on("getEntities", loadEntities, "loader");
	core.on("getTexts", loadEntities, "loader");
	core.on("getThreads", loadEntities, "loader");
	core.on("getNotes", function(query, next) {
		loadRelatedUser("", "me", query.session, function(err, user) {
			if (err) return next(err);
			query.user = user;
			log.d("notes for user:", user.id);

			next();
		});
	}, "loader");
};
