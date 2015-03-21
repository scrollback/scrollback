/* jshint browser: true */

var config, store;
var objUtils = require("./../lib/obj-utils.js");
var rangeOps = require("./range-ops.js");
var state;

module.exports = function(core, conf, s, st) {
	config = conf;
    store = s;
	state = st;

	core.on("setstate", function(changes, next) {
		if (changes.nav) objUtils.extend(state.nav, changes.nav);
		if (changes.context) objUtils.extend(state.context, changes.context);
		if (changes.app) objUtils.extend(state.app, changes.app);

		if (changes.entities) updateEntities(state.entities, changes.entities);
		if (changes.texts) updateTexts(changes.texts);
		if (changes.threads) updateThreads(changes.threads);
		if (changes.session) updateSession(changes.session);
		if (changes.user) updateCurrentUser(changes.user);


		if(changes.nav && changes.nav.textRange) {
//			console.log('textRange is now', changes.nav.textRange);
		}

		buildIndex(changes);
		core.emit("statechange", changes);
		next();
	}, 1);
};

function updateThreads(threads) {
	var rooms = Object.keys(threads), ranges;

	rooms.forEach(function(roomId) {
		ranges = store.get("threads", roomId);
		if(!ranges) ranges = state.threads[roomId] = [];

		if(threads[roomId].length) {
			threads[roomId].forEach(function(newRange) {
				state.threads[roomId] = rangeOps.merge(ranges, newRange, "startTime");
			});
		} else {
			console.log(roomId + ' has no threads yet.');
//			debugger;
		}
	});
}

function updateSession(session) {
	console.log('Session updating to', session);
	state.session = session;
}

function updateCurrentUser(user) {
	state.user = user;
}

function updateTexts(texts) {
	var rooms = Object.keys(texts), ranges;

	rooms.forEach(function(roomThread) {
		ranges = store.get("texts", roomThread);

		if (!ranges) {
			ranges = state.texts[roomThread] = [];
		}

		if (texts[roomThread].length) {
			texts[roomThread].forEach(function(newRange) {
				state.texts[roomThread] = rangeOps.merge(ranges, newRange, "time");
			});
		} else {
			console.log(roomThread);
		}
	});
}

function buildIndex(obj) {
	var relation, items;

	obj.indexes = {
		userRooms: {},
		roomUsers: {},
		textsById: {},
		threadsById: {}
	};

	if (obj.entities) {
		for (var name in obj.entities) {
			relation = obj.entities[name];
			if (relation && relation.room && relation.user) {
				(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
				(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
			}
		}
	}

	if (obj.threads) {
		for (var room in obj.threads) {
			if (obj.threads[room] && obj.threads[room].length) {
				for (var i = 0, l = obj.threads[room].length; i < l; i++) {
					if (obj.threads[room][i]) {
						items = obj.threads[room][i].items;

						if (items && items.length) {
							for (var j = 0, k = items.length; j < k; j++) {
								if (items[j] && items[j].id) {
									obj.indexes.threadsById[items[j].id] = items[j];
								}
							}
						}
					}
				}
			}
		}
	}

	if (obj.texts) {
		for (var roomThread in obj.texts) {
			if (obj.texts[roomThread] && obj.texts[roomThread].length) {
				for (var m = 0, n = obj.texts[roomThread].length; m < n; m++) {
					if (obj.texts[roomThread][m]) {
						items = obj.texts[roomThread][m].items;

						if (items && items.length) {
							for (var o = 0, p = items.length; o < p; o++) {
								if (items[o] && items[o].id) {
									obj.indexes.textsById[items[o].id] = items[o];
								}
							}
						}
					}
				}
			}
		}
	}
}

function updateEntities(stateEntities, changesEntities) {
	objUtils.extend(stateEntities, changesEntities);
	buildIndex(state);
}

/*function updateIndex(type, ranges) {
	ranges.forEach(function(r) {
		var index = store.indexes[type + "ById"] = store.indexes[type + "ById"] || {};
		r.items.forEach(function(item) {
			index[item.id] = item;
		});
	});
}*/
