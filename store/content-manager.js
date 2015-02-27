var store, core, config;
var relationsProps = ['role', 'transistionTime'];
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	core.on("setState", function(newState, next) {
		if (newState.nav.room) handleRoomChange(newState);
		if (newState.nav.textRange) handleTextChange(newState);
		if (newState.nav.threadRange) handleThreadChange(newState);
		next();
	});

	function constructEntitiesFromRoomList(list, entities, userId) {
		list.forEach(function(e) {
			var relation = {};
			relation.room = e.id;
			relation.user = userId;
			relation.status = "online";
			relationsProps.forEach(function(key) {
				if (relation[key]) {
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

		core.emit("setState", {
			entities: entities
		});
		next();
	}, 1000);


	core.on("join-dn", onJoin, 1000);
	core.on("text-up", onText, 1000);
	core.on("text-dn", onText, 1000);
};

function onText(text, next) {
	var textRange = {
		start: text.time,
		end: null, 
		items: [text]
	}, key, newState = {};
	
	key = text.to;
	if(text.thread) key += text.thread;
	newState.texts[key] = textRange; 
	core.emit("setState", newState);
	next();
}

function onJoin(join, next) {
	var room = join.room;
	var user = join.user;
	var relation = {},
		entities = {};

	relation.user = user.id;
	relation.room = room.id;
	relationsProps.forEach(function(prop) {
		relation[prop] = join[prop];
	});

	entities[room.id] = room;
	entities[user.id] = user;
	entities[room.id + "_" + user.id] = relation;

	core.emit("setState", {
		entities: entities
	});
	return next();
}

function loadRoom(roomId) {
	core.emit("getEntity", (roomId.indexOf(":") >= 0) ? {
		identity: roomId
	} : {
		ref: roomId
	}, function(err, data) {
		var newRoom, updatingState = {
			entities: {}
		};

		if (!err && data.results.length) {
			newRoom = data.results[0];

			if (roomId !== newRoom.id) {
				updatingState.nav = {
					room: newRoom.id
				};
			}

			updatingState.entities[roomId] = null;
			updatingState.entities[newRoom.id] = newRoom;
			core.emit("setstore", updatingState);
		}
	});
}

function constructEntitiesFromUserList(list, entities, roomId) {
	list.forEach(function(e) {
		var relation = {};
		relation.room = roomId;
		relation.user = e.id;
		relation.status = "online";
		relationsProps.forEach(function(key) {
			if (relation[key]) {
				relation[key] = e[key];
				delete e[key];
			}
		});
		entities[e.id] = e;
		entities[roomId + "_" + e.id] = relation;
	});

	return entities;
}

function loadOccupants(roomId) {
	core.emit("getUsers", {
		occupantOf: roomId
	}, function(err, data) {
		var entities = {};
		entities = constructEntitiesFromUserList(data.results, entities, data.occupantOf);
		core.emit("setState", {
			entities: entities
		});
	});
}

function loadMembers(roomId) {
	core.emit("getUsers", {
		memberOf: roomId
	}, function(err, data) {
		var entities = {};
		entities = constructEntitiesFromUserList(data.results, entities, data.memberOf);
		core.emit("setState", {
			entities: entities
		});
	});
}

function handleRoomChange(newState) {
	var roomId = newState.nav.room;
	var roomObj = store.getRoom(roomId);

	if (typeof roomObj === "string" && roomObj == "missing") {
		newState.entities[roomId] = "missing";
		loadRoom(roomId);
		if (roomId.indexOf(":") < 0 && !store.getRelatedUsers(roomId).length) {
			loadMembers(roomId);
			loadOccupants(roomId);
		}
	} else {
		newState.entities[roomId] = roomObj;
	}
}

function textResponse(err, texts) {
	var updatingState = {},
		range = {},
		key = texts.to;

	if (texts.thread) key += "_" + texts.thread;

	if (!err && texts.results) {
		if (texts.before) {
			range.end = texts.time;
			range.start = texts.results[0].time;
		} else {
			range.start = texts.time;
			range.end = texts.results[texts.results.length - 1].time;
		}
		range.items = texts.results;
		updatingState.texts[key].push({
			start: texts.results[0].time,
			end: texts.time,
			items: texts.results
		});
		core.emit("setState", updatingState);
	}
}

function handleTextChange(newState) {
	var textRange = newState.textRange,
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
	var updatingState = {},
		range = {};

	if (!err && threads.results) {
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
		core.emit("setState", updatingState);
	}
}

function handleThreadChange(newState) {
	var threadRange = newState.threadRange,
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