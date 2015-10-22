"use strict";

var objUtils = require("./../lib/obj-utils.js");

module.exports = function createBulkQuery(core, store, type) {
	var queryCount = 0,
		changes = {},
		queriedRooms = {};

	changes[type] = {};

	function done(err, query) {
		var key;
		queryCount--;
		if (!err && query && query.results && query.results.length) {
			key = query.to + (query.thread ? "_" + query.thread : "");

			(changes[type][key] = changes[type][key] || []).push({
				start: query.results.length ? (
					query.results[0][type === "texts" ? "time" : "startTime"]
				) : null,
				end: null,
				items: query.results
			});
		}
		if (queryCount === 0 && changes[type] && Object.keys(changes[type]).length) {
			core.emit("setstate", objUtils.clone(changes));
			changes = {};
		}
	}

	function add(roomId) {
		var parts;
		if (queriedRooms[roomId]) return;
		queriedRooms[roomId] = true;


		if (type === "texts") {
			parts = roomId.split("_");
			if (store.getTexts(parts[0], parts[1], null, -4)[0] !== "missing") return;
			queryCount++;
			core.emit("getTexts", {to: parts[0], thread: parts[1], time: null, before: 4}, done);
		} else {
			if (store.getThreads(roomId, null, -2)[0] !== "missing") return;
			queryCount++;
			core.emit("getThreads", {to: roomId, time: null, before: 2}, done);
		}
	}

	return add;
};
