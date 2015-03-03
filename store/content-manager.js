var store, core, config;
var relationsProps = ['role', 'roleSince'];
var pendingActions = {};
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	core.on("setstate", function(newState, next) {
		if (!newState.nav) return next();
		if (newState.nav.room) {
			handleRoomChange(newState);
			if (!newState.nav.textRange) {
				newState.nav.textRange = {
					time: null,
					above: 50
				};
			}
			if (!newState.nav.threadRange) {
				newState.nav.threadRange = {
					time: null,
					above: 50
				};
			}
		}
		if (newState.nav.textRange) handleTextChange(newState);
		if (newState.nav.threadRange) handleThreadChange(newState);
		next();
		core.emit("statechange", newState);
	}, 900);

	function constructEntitiesFromRoomList(list, entities, userId) {
		list.forEach(function(e) {
			var relation = {};
			relation.room = e.id;
			relation.user = userId;
			relationsProps.forEach(function(key) {
				if (e[key]) {
					relation[key] = e[key];
					delete e[key];
				}
			});
			entities[e.id] = e;
			entities[e.id + "_" + userId] = relation;
		});

		return entities;
	}
	core.on("init-dn", function(init, next) {
		var entities = {};
		if (!init.user.id) return next();

		if (init.occupantOf) entities = constructEntitiesFromRoomList(init.occupantOf, entities, init.user.id);
		if (init.memberOf) entities = constructEntitiesFromRoomList(init.memberOf, entities, init.user.id);
		entities[init.user.id] = init.user;
		core.emit("setstate", {
			entities: entities,
			user: init.user.id
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
	var entities = {},
		relation = {
			room: action.to,
			user: action.from,
			status: action.type == "away" ? "offline" : "online"
		};
	relationsProps.forEach(function(key) {
		if (action.room[key]) {
			relation[key] = action.room[key];
			delete action.to[key];
		}
	});

	entities[action.to] = action.room;
	entities[action.from] = action.user;
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
		key, newState = {};
	pendingActions[text.id] = text;
	key = text.to;
	if (text.thread) key += text.thread;
	newState.texts[key] = textRange;
	core.emit("setstate", newState);
	next();
}

function onTextDn(text, next) {
	var textRange = {
			start: text.time,
			end: null,
			items: [text]
		},
		key, newState = {};

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

function loadRoom(roomId) {
	core.emit("getEntities", (roomId.indexOf(":") >= 0) ? {
		identity: roomId
	} : {
		ref: roomId
	}, function(err, data) {
		var newRoom, updatingState = {
			entities: {}
		};

		if (!err && data.results && data.results.length) {
			newRoom = data.results[0];

			if (roomId !== newRoom.id) {
				updatingState.nav = {
					room: newRoom.id
				};
			}

			updatingState.entities[roomId] = null;
			updatingState.entities[newRoom.id] = newRoom;
			core.emit("setstate", updatingState);
		}
	});
}

function constructEntitiesFromUserList(list, entities, roomId) {
	list.forEach(function(e) {
		var relation;

		if (entities[roomId + "_" + e.id]) relation = entities[roomId + "_" + e.id];
		else relation = {};

		relation.room = roomId;
		relation.user = e.id;
		relation.status = "offline";
		relationsProps.forEach(function(key) {
			if (e[key]) {
				relation[key] = e[key];
				delete e[key];
			}
		});
		entities[e.id] = e;
		entities[roomId + "_" + e.id] = relation;
	});
}

function loadUsersList(roomId) {
	var occupantList, memberList, done = false,
		entities = {};

	function emitSetState() {
		constructEntitiesFromUserList(memberList, entities, roomId);
		constructEntitiesFromUserList(occupantList, entities, roomId);
		occupantList.forEach(function(e) {
			entities[roomId + "_" + e.id].status = "online";
		});
		core.emit("setstate", {
			entities: entities
		});
	}

	core.emit("getUsers", {
		type: "getUsers",
		memberOf: roomId
	}, function(err, data) {
		memberList = data.results || [];
		if (!done) done = true;
		else emitSetState();
	});
	core.emit("getUsers", {
		type: "getUsers",
		occupantOf: roomId
	}, function(err, data) {
		occupantList = data.results || [];
		if (!done) done = true;
		else emitSetState();
	});
}

function handleRoomChange(newState) {
	var roomId = newState.nav.room;
	var roomObj = store.getRoom(roomId);
	if (typeof roomObj === "string" && roomObj == "missing") {
		if (!newState.entities) newState.entities = [];
		newState.entities[roomId] = "missing";
		loadRoom(roomId);
		if (roomId.indexOf(":") < 0 && !store.getRelatedUsers(roomId).length) {
			loadUsersList(roomId);
		}
	}
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
	var textRange = newState.nav.textRange,
		thread = (newState.nav.thread ? newState.nav.thread : store.getNav("thread")),
		roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
		time = textRange.time || null,
		ranges = [];

	if (textRange.above) ranges.push(store.getTexts(roomId, thread, time, textRange.above));
	if (textRange.below) ranges.push(store.getTexts(roomId, thread, time, -textRange.below));

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
			range.start = threads.results[0].time;
		} else {
			range.start = threads.time;
			range.end = threads.results[threads.results.length - 1].time;
		}
		range.items = threads.results;
		updatingState.threads[threads.to].push({
			start: threads.results[0].time,
			end: threads.time,
			items: threads.results
		});
	}
	core.emit("setstate", updatingState);
}

function handleThreadChange(newState) {
	var threadRange = newState.nav.threadRange,
		roomId = (newState.nav.room ? newState.nav.room : store.getNav("room")),
		time = threadRange.time || null,
		ranges = [];


	if (threadRange.above) ranges.push(store.getTexts(roomId, time, threadRange.above));
	if (threadRange.below) ranges.push(store.getTexts(roomId, time, -threadRange.below));

	ranges.forEach(function(r) {
		if (r[0] == "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: time,
				before: 256
			}, threadResponse);
		}
		if (r[r.length - 1] == "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: r.length >= 2 ? r.length - 2 : threadRange.time,
				after: 256
			}, threadResponse);
		}
	});
}