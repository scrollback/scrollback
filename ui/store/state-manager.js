/* jshint browser: true */

"use strict";

var objUtils = require("../../lib/obj-utils.js"),
	state = {
		nav: {},
		context: {},
		app: {},
		texts: {},
		threads: {},
		entities: {}
	};

function buildIndex(obj) {
	var relation;

	obj.indexes = {
		userRooms: {},
		roomUsers: {}
	};

	for (var name in obj.entities) {
		relation = obj.entities[name];

		if (relation.room && relation.user) {
			(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
			(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
		}
	}
}

function extendObj(obj1, obj2) {
	if (typeof obj1 !== "object" || typeof obj2 !== "object") {
		return obj1;
	}

	for (var name in obj2) {
		if (obj2[name] === null) {
			delete obj1[name];
		} else if (typeof obj1[name] === "object" && typeof obj2[name] === "object" && obj1[name] !== null) {
			obj1[name] = obj2[name];
			// extendObj(obj1[name], obj2[name]);
		} else {
			obj1[name] = obj2[name];
		}
	}

	return obj1;
}

// TODO: implement properly;
function mergeRanges(original, newrange, key) {
	original.concat(newrange);
	key = key; // suppress silly jshint error. I dont know how.
}

function findIndex(items, propName, value, start, end) {
	var pos;

	if (typeof start === "undefined") {
		return findIndex(items, propName, value, 0, items.length);
	}

	if (value === null) {
		return end;
	}

	if (start >= end) {
		return start;
	}

	pos = ((start + end) / 2) | 0;

	if (items[pos] && items[pos][propName] < value) {
		return findIndex(items, propName, value, pos + 1, end);
	} else if (items[pos - 1] && items[pos - 1][propName] >= value) {
		return findIndex(items, propName, value, start, pos - 1);
	} else {
		return pos;
	}
}

function getItems(ranges, propName, value, interval) {
	var index, startIndex, endIndex, range, missingAbove, missingBelow;

	if (!ranges) {
		return;
	}

	range = ranges.filter(function(r) {
		return (
			(value === null && r.end === null) ||
			((r.start === null || r.start < value) &&
			(r.end === null || r.end > value))
		);

	})[0];

	if (!range) {
		return ["missing"];
	}

	index = findIndex(range.items, propName, value);

	if (interval < 0) {
		startIndex = index + interval;
		endIndex = index;
	} else {
		startIndex = index;
		endIndex = index + interval;
	}

	if (startIndex < 0) {
		missingAbove = true;
		startIndex = 0;
	}

	if (endIndex > range.items.length) {
		missingBelow = true;
		endIndex = range.items.length;
	}

	return [].concat(
		(missingAbove ? ["missing"] : []),
		range.items.slice(startIndex, endIndex),
		(missingBelow ? ["missing"] : [])
	);
}

module.exports = function(core) {
	core.on("setstate", function(changes, next) {
		var roomId, roomThreadId;

		// merge store and changes
		extendObj(state.nav, changes.nav);
		extendObj(state.context, changes.context);
		extendObj(state.app, changes.app);
		extendObj(state.entities, changes.entities); // Todo: replace with shallow extend

		if (changes.user) {
			state.user = changes.user;
		}

		if (changes.texts) {
			for (roomThreadId in changes.texts) {
				if (state.texts[roomThreadId]) {
					mergeRanges(state.texts[roomThreadId], changes.texts[roomThreadId], "time");
				} else {
					state.texts[roomThreadId] = changes.texts[roomThreadId];
				}
			}
		}

		if (changes.threads) {
			for (roomId in changes.threads) {
				if (state.threads[roomId]) {
					mergeRanges(state.threads[roomId], changes.threads[roomId], "startTime");
				} else {
					state.threads[roomId] = changes.threads[roomId];
				}
			}
		}

		buildIndex(changes);
		buildIndex(state); // TODO: replace this call with some way to merge the indexes from changes into store; save CPU!

		core.emit("statechange", changes);

		next();
	}, 1);

	return {
		get: function() {
			var args = Array.prototype.slice.call(arguments);

			args.unshift(state);

			return objUtils.get.apply(null, args);
		},
		getThreads: function(roomId, timestamp, interval) {
			return getItems(state.threads[roomId], "startTime", timestamp, interval);
		},
		getTexts: function(roomId, threadId, timestamp, interval) {
			return getItems(state.texts[roomId + (threadId ? "_" + threadId : "")], "time", timestamp, interval);
		},
		getEntity: function(entity) {
			if (typeof entity !== "string") {
				return;
			}

			return this.get("entities", entity);
		},
		getRoom: function(room) {
			var roomobj;

			if (typeof room === "undefined") {
				return this.get("entities", this.get("nav", "room"));
			}

			roomobj = this.get("entities", room);

			if ( roomobj && roomobj.type === "room") {
				return roomobj;
			} else {
				return;
			}
		},
		getUser: function(user) {
			var userobj;

			if (typeof user === "undefined") {
				return this.get("entities", this.get("user"));
			}

			userobj = this.get("entities", user);

			if (userobj && userobj.type === "user") {
				return userobj;
			} else {
				return;
			}
		},
		getRelation: function(room, user) {
			if (typeof room === "undefined") {
				room = this.get("nav", "room");
			}

			if (typeof user === "undefined") {
				user = this.get("user");
			}

			return this.get("entities", room + "_" + user);
		},
		getRelatedRooms: function(user) {
			if (typeof user === "undefined") {
				user = this.get("user");
			}

			return this.get("indexes", "userRooms", user);
		},
		getRelatedUsers: function(room) {
			if (typeof user === "undefined") {
				room = this.get("nav", "room");
			}

			return this.get("indexes", "roomUsers", room);
		},
		getNav: function() {
			return this.get("nav");
		},
		getContext: function() {
			return this.get("context");
		},
		getApp: function() {
			return this.get("app");
		}
	};
};
