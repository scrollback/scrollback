/* jshint esnext: true, browser: true */

"use strict";

const objUtils = require("./../lib/obj-utils.js"),
	  rangeOps = require("./range-ops.js");

let allChanges = {},
	gapTimer = null,
	lagTimer = null,
	core, store, state;

module.exports = function(c, conf, s, st) {
	core = c;
	store = s;
	state = st;

	core.on("setstate", function(changes) {
		applyChanges(changes, allChanges);
		applyChanges(changes, state);
		buildIndex(state, changes);

		if (gapTimer) { clearTimeout(gapTimer); }

		gapTimer = setTimeout(fireStateChange, 50); // If nothing else happens within 100ms, fire.

		if (!lagTimer) { lagTimer = setTimeout(fireStateChange, 100); } // Don't delay any statechange more than 100ms
	}, 1);
};

function fireStateChange() {
	clearTimeout(gapTimer);
	clearTimeout(lagTimer);

	gapTimer = lagTimer = null;

	buildIndex(allChanges);

	core.emit("statechange", allChanges);

	allChanges = {};
}

function applyChanges(changes, base) {
	if (changes.nav)      { base.nav      = objUtils.deepFreeze(objUtils.merge(objUtils.clone(base.nav)      || {}, changes.nav)); }
	if (changes.context)  { base.context  = objUtils.deepFreeze(objUtils.merge(objUtils.clone(base.context)  || {}, changes.context)); }
	if (changes.app)      { base.app      = objUtils.deepFreeze(objUtils.merge(objUtils.clone(base.app)      || {}, changes.app)); }

	if (changes.entities) {
		for (var e in changes.entities) {
			objUtils.deepFreeze(changes.entities[e]);
		}

		base.entities = objUtils.merge(base.entities || {}, changes.entities);
	}

	if (changes.notifications)	{ updateNotifications	(base.notifications	= base.notifications	|| [], changes.notifications); }
	if (changes.texts)			{ updateTexts			(base.texts			= base.texts			|| {}, changes.texts); }
	if (changes.threads)		{ updateThreads			(base.threads		= base.threads			|| {}, changes.threads); }

	if (changes.session)		{ base.session = changes.session; }
	if (changes.user)			{ base.user    = changes.user; }
}

function updateNotifications(baseNotifications, notifications) {
	for (let notif of notifications) {
		for (let i = 0, l = baseNotifications.length; i < l; i++) {
			if (baseNotifications[i] && baseNotifications[i].id === notif.id) {
				baseNotifications.splice(i, 1);
			}
		}

		if (notif.status !== "dismissed") {
			baseNotifications.push(objUtils.deepFreeze(notif));
		}
	}

	baseNotifications.sort((a, b) => a.time - b.time);
}

function updateThreads(baseThreads, threads) {
	var rooms = Object.keys(threads), ranges;

	rooms.forEach(function(roomId) {
		ranges = store.get("threads", roomId);

		if (!ranges) { ranges = baseThreads[roomId] = []; }

		if (threads[roomId].length) {
			threads[roomId].forEach(function(newRange) {
				newRange.items.forEach(objUtils.deepFreeze);
				baseThreads[roomId] = rangeOps.merge(ranges, newRange, "startTime");
			});
		} else {
			console.log(roomId + ' has no threads yet.');
		}
	});
}

function updateTexts(baseTexts, texts) {
	var rooms = Object.keys(texts), ranges;

	rooms.forEach(function(roomThread) {
		ranges = store.get("texts", roomThread);

		if (!ranges) {
			ranges = baseTexts[roomThread] = [];
		}

		if (texts[roomThread].length) {
			texts[roomThread].forEach(function(newRange) {
				newRange.items.forEach(objUtils.deepFreeze);
				baseTexts[roomThread] = rangeOps.merge(ranges, newRange, "time");
			});
		}
	});
}

function buildIndex(obj, changes) {
	var relation;

	// Changes are passed so that we don’t waste time rebuilding indexes that are still valid.
	changes = changes || obj;

	obj.indexes = obj.indexes || {
		userRooms: {},
		roomUsers: {},
		textsById: {},
		threadsById: {}
	};

	if (obj.entities && changes.entities) {
		obj.indexes.userRooms = {};
		obj.indexes.roomUsers = {};

		for (var name in obj.entities) {
			relation = obj.entities[name];
			if (relation && relation.room && relation.user) {
				(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
				(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
			}
		}

		objUtils.deepFreeze(obj.indexes.userRooms);
		objUtils.deepFreeze(obj.indexes.roomUsers);
	}

	function buildRangeIndex(obj, prop) {
		var index = obj.indexes[prop + "ById"] = {};

		for (var room in obj[prop]) {
			if (obj[prop][room].forEach) {
				obj[prop][room].forEach(function(range) {
					range.items.forEach(function(item) {
						index[item.id] = item;
					});
				});
			}
		}

		objUtils.deepFreeze(obj.indexes[prop + "ById"]);
	}

	if (obj.threads && changes.threads) { buildRangeIndex(obj, 'threads'); }
	if (obj.texts && changes.texts) { buildRangeIndex(obj, 'texts'); }
}
