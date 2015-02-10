/* jshint browser: true */

"use strict";

var objUtils = require("../../lib/obj-utils.js"),
	current = {
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

// TODO: implement;
// function mergeRanges(original, newrange, key) {
// }

function findIndex (items, propName, value, start, end) {
    var pos;

    if (typeof start === 'undefined') {
        return findIndex(propName, value, 0, items.length);
    }

    if (value === null) {
        return end;
    }

    if (start >= end) return start;
    pos = ((start + end) / 2) | 0;

    if (items[pos] && items[pos][propName] < value) {
        return findIndex(propName, value, pos + 1, end);
    } else if (items[pos - 1] && items[pos - 1][propName] >= value) {
        return findIndex(propName, value, start, pos - 1);
    } else {
        return pos;
    }
}

function getItems(ranges, propName, value, interval) {
    var index, startIndex, endIndex, range, missingAbove, missingBelow;

    if (!ranges) {
    	return;
    }

    range = ranges.filter(function (r) {
        return (
            (value === null && r.end === null) ||
            ((r.start === null || r.start < value) &&
            (r.end === null || r.end > value))
        );

    })[0];

    if(!range) return ["missing"];

    index = findIndex(range.items, propName, value);
    if(interval < 0) {
    	startIndex = index + interval;
    	endIndex = index;
    } else {
    	startIndex = index;
    	endIndex = index + interval;
    }

    if(startIndex < 0) {
        missingAbove = true;
        startIndex = 0;
    }

    if(endIndex > range.items.length) {
        missingBelow = true;
        endIndex = range.items.length;
    }

    return [].concat(
        (missingAbove? ['missing']: []),
        range.items.slice(startIndex, endIndex),
        (missingBelow? ['missing']: [])
    );
}

window.state = {
	get: function() {
		var args = Array.prototype.slice.call(arguments);

		args.unshift(current);

		return objUtils.get.apply(null, args);
	},
	getThreads: function (roomId, timestamp, interval) {
		return getItems(current.threads[roomId], 'startTime', timestamp, interval);
	},
	getTexts: function (roomId, threadId, timestamp, interval) {
		return getItems(current.texts[roomId + (threadId? '_' + threadId: '')], 'time', timestamp, interval);
	}
};

module.exports = function(core) {
	core.on("setstate", function(changes, next) {
		var roomId, threadId;

		// merge state and changes
		extendObj(current.nav, changes.nav);
		extendObj(current.context, changes.context);
		extendObj(current.app, changes.app);
		extendObj(current.entities, changes.entities); // Todo: replace with shallow extend

		if (changes.userId) {
			current.userId = changes.userId;
		}

		if (changes.texts) {
			for(roomId in changes.texts) {
				if (changes.threads.roomId && changes.threads.roomId[0] && changes.threads.roomId[0].items) {
					for (var i = 0, l = changes.threads.roomId[0].items.length; i < l; i++) {
						threadId = changes.threads.roomId[0].items[i].id;

						if (current.texts[roomId + "_" + threadId]) {
							// mergeRanges(current.texts[roomId + "_" + threadId], changes.texts[roomId + "_" + threadId], 'time');
						} else {
							current.texts[roomId + "_" + threadId] = changes.texts[roomId + "_" + threadId];
						}
					}
				}
			}
		}

		if (changes.threads) {
			for (roomId in changes.threads) {
				if (current.threads[roomId]) {
					// mergeRanges(current.threads[roomId], changes.threads[roomId], 'startTime');
				} else {
					current.threads[roomId] = changes.threads[roomId];
				}
			}
		}

		buildIndex(changes);
		buildIndex(current); // TODO: replace this call with some way to merge the indexes from changes into state; save CPU!

		core.emit("statechange", changes);

		next();
	}, 1);
};

