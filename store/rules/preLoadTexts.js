"use strict";

var core, store;
//var entityOps = require("./../entity-ops.js");

var query;

module.exports = function() {
	core = arguments[0];
	store = arguments[2];

	query = require("../bulkQuery.js")(core, store, "texts");

	core.on("setstate", function(changes, next) {
		var room = store.get("nav", "room") || "",
			current = store.get(),
			threadRanges;

		if (
			(changes.nav && changes.nav.mode ||
			current.nav && current.nav.mode) === "room" // don’t bother except in the room mode
		) {
			threadRanges = Array.prototype.concat(
				changes.threads && changes.threads[room] || [],
				current.threads && current.threads[room] || []
			);

			threadRanges.forEach(function(threadRange) {
				if(threadRange.items && threadRange.items.length) {
					threadRange.items.forEach(function(threadObj) {
						if(store.getTexts(room, threadObj.id, null, -3)[0] !== "missing") return;
						query(room + '_' + threadObj.id);
					});
				}
			});
		}
		next();
	}, 800);
};
