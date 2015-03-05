var store, core, config;
var entityOps = require("./entity-ops.js");
var relationsProps = require("./property-list.js").relations;
var pendingActions = {};
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	core.on("setstate", function(newState, next) {
		if (newState.nav) {
			if (newState.nav.room) {
				if (!newState.nav.threadRange) {
					newState.nav.threadRange = {
						time: null,
						before: 50
					};
				}
			}
			if (newState.nav.thread || newState.nav.room) {
				if (!newState.nav.textRange) {
					newState.nav.textRange = {
						time: null,
						before: 50
					};
				}
				handleTextChange(newState);
			}
			if (newState.nav.threadRange) handleThreadRangeChange(newState);
		}

		next();
	}, 900);

	function constructEntitiesFromRoomList(list, entities, userId) {
		list.forEach(function(e) {
			var relation = {}, entity = {};
			relation.room = e.id;
			relation.user = userId;
			relation = entityOps.relatedEntityToRelation(e, {id:userId,type:"user"});
			entity = entityOps.relatedEntityToEntity(e);
			entities[e.id] = entity;
			entities[e.id + "_" + userId] = relation;
		});

		return entities;
	}
	core.on("init-dn", function(init, next) {
		var entities = {};
		if (!init.user.id) {
			entities[store.get("user")] = init.user;
			core.emit("setstate", {entities:entities});
			return next();
		}

		if (init.occupantOf) entities = constructEntitiesFromRoomList(init.occupantOf, entities, init.user.id);
		if (init.memberOf) entities = constructEntitiesFromRoomList(init.memberOf, entities, init.user.id);
		entities[init.user.id] = init.user;
		core.emit("setstate", {
			entities: entities,
			user: init.user.id
		});
		core.emit("getRooms", {featured: true}, function(err, rooms) {
			var featuredRooms = [], entities = {};
			if(rooms && rooms.results) {
				rooms.results.forEach(function(e) {
					if(e) {
						featuredRooms.push(e.id);
						entities[e.id] = e;
					}

				});
			}
			core.emit("setstate", {
				app:{
					featuredRooms: featuredRooms
				},
				entities: entities
			});
		});
		next();
	}, 1000);


	core.on("join-dn", onJoin, 1000);
	core.on("part-dn", onPart, 1000);
	core.on("text-up", onTextUp, 1000);
	core.on("text-dn", onTextDn, 1000);
	core.on("away-dn", presenseChange, 1000);
	core.on("back-dn", presenseChange, 1000);
	core.on("room-dn", entityEvent, 1000);
	core.on("user-dn", entityEvent, 1000);
};

function entityEvent(action, next) {
	var entities = {};
	entities[action.to] = action[action.type == "room" ? "room" : "user"];
	core.emit("setstate", {
		entities: entities
	});
	next();
}

function presenseChange(action, next) {
	var entities = {}, relation;
	if(!action.room) action.room = store.getRoom(action.to);
	if(!action.user) action.user = store.getRoom(action.from);

	entities[action.to] = entityOps.relatedEntityToEntity(action.room || {});
	entities[action.from] = entityOps.relatedEntityToEntity(action.user || {});
	relation = entityOps.relatedEntityToRelation(entities[action.to], {id:action.from, type:"user"});
	relation.status = action.type == "away" ? "offline" : "online";

	entities[relation.room + "_" + relation.user] = relation;
	core.emit("setstate", {
		entities: entities
	});
	next();
}

function onTextUp(text, next) {
	var textRange = {
			start: text.time,
			end: null,
			items: [text]
		},
		key, newState = {texts:{}};
	next();
	pendingActions[text.id] = text;
	key = text.to;
	if (text.thread) key += text.thread;
	newState.texts[key] = textRange;
	core.emit("setstate", newState);

}

function onTextDn(text, next) {
	var textRange = {
			start: text.time,
			end: null,
			items: [text]
		},
		key, newState = {texts:{}};

	key = text.to;
	if (text.thread) key += text.thread;
	newState.texts[key] = textRange;
	if (pendingActions[text.id]) {
		newState.texts[pendingActions[text.id].to + pendingActions[text.id].thread ? "_" + pendingActions[text.id].thread : ""] = {
			start: pendingActions[text.id].time,
			end: pendingActions[text.id].time,
			items: [

			]
		};
	}

	core.emit("setstate", newState);
	next();
}

function onJoin(join, next) {
	var room = join.room;
	var user = join.user;
	var relation = {},
		entities = {};

	relation.user = user.id;
	relation.room = room.id;

	relationsProps.forEach(function(key) {
		if (join.room[key]) {
			relation[key] = join.room[key];
			delete join.to[key];
		}
	});

	relationsProps.forEach(function(prop) {
		relation[prop] = join[prop];
	});

	entities[room.id] = room;
	entities[user.id] = user;
	entities[room.id + "_" + user.id] = relation;

	core.emit("setstate", {
		entities: entities
	});
	return next();
}



function onPart(part, next) {
	var room = part.room;
	var user = part.user;
	var entities = {};

	entities[room.id] = room;
	entities[user.id] = user;
	entities[room.id + "_" + user.id] = null;

	core.emit("setstate", {
		entities: entities
	});
	return next();
}


function textResponse(err, texts) {
	var updatingState = {
			texts: {}
		},
		range = {},
		key = texts.to;

	if (texts.thread) key += "_" + texts.thread;

	if (!err && texts.results && texts.results.length) {
		if (texts.before) {
			range.end = texts.time;
			range.start = texts.results[0].time;
		} else {
			range.start = texts.time;
			range.end = texts.results[texts.results.length - 1].time;
		}
		range.items = texts.results;

		updatingState.texts[key] = [{
			start: texts.results[0].time,
			end: texts.time,
			items: texts.results
		}];
		core.emit("setstate", updatingState);
	}
}

function handleTextChange(newState) {
	var textRange = newState.nav.textRange || {},
		thread = (newState.nav.thread ? newState.nav.thread : store.getNav("thread")),
		roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
		time = textRange.time || null,
		ranges = [];

	if (textRange.after) ranges.push(store.getTexts(roomId, thread, time, textRange.after));
	if (textRange.before) ranges.push(store.getTexts(roomId, thread, time, -textRange.before));

	ranges.forEach(function(r) {
		if (r[0] == "missing") {
			core.emit("getTexts", {
				to: roomId,
				thread: thread,
				time: time,
				before: 256
			}, textResponse);
		}
		if (r[r.length - 1] == "missing") {
			core.emit("getTexts", {
				to: roomId,
				thread: thread,
				time: r.length >= 2 ? r.length - 2 : textRange.time,
				after: 256
			}, textResponse);
		}
	});
}

function threadResponse(err, threads) {
	var updatingState = {
			threads: {}
		},
		range = {};
	updatingState.threads[threads.to] = [];
	if (!err && threads.results && threads.results.length) {
		if (threads.before) {
			range.end = threads.time;
			range.start = threads.results[0].startTime;
		} else {
			range.start = threads.time;
			range.end = threads.results[threads.results.length - 1].startTime;
		}
		range.items = threads.results;
		updatingState.threads[threads.to].push({
			start: threads.results[0].startTime,
			end: threads.time,
			items: threads.results
		});
	}
	core.emit("setstate", updatingState);
}

function handleThreadRangeChange(newState) {
	var threadRange = newState.nav.threadRange,
		roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
		time = threadRange.time || null,
		ranges = [];


	if (threadRange.after) ranges.push(store.getTexts(roomId, time, threadRange.after));
	if (threadRange.before) ranges.push(store.getTexts(roomId, time, -threadRange.before));

	ranges.forEach(function(r) {
		if (r[0] == "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: time,
				before: 16
			}, threadResponse);
		}
		if (r[r.length - 1] == "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: r.length >= 2 ? r.length - 2 : threadRange.time,
				after: 16
			}, threadResponse);
		}
	});
}
