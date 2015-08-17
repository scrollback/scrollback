/*
	Rule: LoadThreadsOnThreadRange
	Requires: threadRange
	Provides: threads (async)
*/

/*eslint no-use-before-define:0 */
"use strict";
var permissionLevels = require("./../../authorizer/permissionWeights.js");
module.exports = function(core, config, store) {
	core.on('setstate', function(changes) {
		var future = store.with(changes),
			roomId = future.get("nav", "room"),
			userId = future.get("user"),
			rel = roomId + "_" + userId,
			getRelation = store.getRelation(roomId, userId),
			roomObj = store.getRoom(roomId),
			userRelation = getRelation ? getRelation.role : "none",
			guides = roomObj ? roomObj.guides : {};


		if (
			(changes.nav && (
				"room" in changes.nav ||
				"threadRange" in changes.nav
			)) || (
				changes.entities &&
				changes.entities[rel]
			)) {
			if (
				(guides && guides.authorizer && (
					permissionLevels[userRelation] < permissionLevels[guides.authorizer.readLevel]
				)) || (
					userRelation === "banned"
				)) {
				return;
			}
			handleThreadChange(future);
		}
	}, 850);

	function threadResponse(err, threads) {
		var updatingState = {
				threads: {}
			},
			range = {};

		if (!err && threads.results) {
			updatingState.threads[threads.to] = [];

			if (threads.before) {
				range.end = threads.time;
				range.start = threads.results.length < threads.before ? null : threads.results[0].startTime;
			} else if (threads.after) {
				range.start = threads.time ? threads.time : Date.now();
				range.end = threads.results.length < threads.after ? null : threads.results[threads.results.length - 1].startTime;
			}

			range.items = threads.results;

			updatingState.threads[threads.to].push(range);

			core.emit("setstate", updatingState);
		}
	}

	function handleThreadChange(future) {
		var roomId = future.get("nav", "room"),
			time = future.get("nav", "threadRange", "time") || null,
			before = future.get("nav", "threadRange", "before"),
			after = future.get("nav", "threadRange", "after"),
			r, queryTime;

		r = store.getThreads(roomId, time, (after || 0) + 5);

		if (r[r.length - 1] === "missing") {
			queryTime = (r.length > 1 ? r[r.length - 2].startTime : time);
			if (queryTime !== null) {
				core.emit("getThreads", {
					to: roomId,
					time: queryTime,
					after: Math.max(16, (after || 0) - r.length + 1)
				}, threadResponse);
			}
		}

		r = store.getThreads(roomId, time, -(before || 0) - 5);

		if (r[0] === "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: (r.length > 1 ? r[1].startTime : time),
				before: Math.max(16, (before || 0) - r.length + 1)
			}, threadResponse);
		}

	}
};