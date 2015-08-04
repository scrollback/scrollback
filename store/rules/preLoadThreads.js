"use strict";

var regexUtils = require("../../lib/regex-utils.js"),
	core, store;

var query;

module.exports = function() {
	core = arguments[0];
	store = arguments[2];

	query = require("../bulkQuery.js")(core, store, "threads");

	core.on("setstate", function(changes, next) {
		var user = store.get("user") || "",
			room = store.get("nav", room) || "",
			regex = new RegExp("_" + regexUtils.escape(user) + "$"),
			future = store.with(changes);

		if (changes.app && changes.app.featuredRooms) {
			changes.app.featuredRooms.forEach(query);
		}

		if (future.get("nav").mode === "home") {
			if (changes.entities && user) {
				Object.keys(changes.entities).forEach(function(key) {
					if (regex.test(key) && changes.entities[key] && changes.entities[key].room) {
						query(changes.entities[key].room);
					}
				});
			}

			store.getRelatedRooms().forEach(function(e) {
				query(e.id);
			});
		}

		next();
	}, 800);
};
