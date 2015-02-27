var store, core, config;
var relationsProps = ['role', 'transistionTime'];
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	core.on("setState", function(newState, next) {
		/*
        check for the changes in room, thread their ranges. load stuff from the server if not available fire a query and call next with loading property.
        else
        call next and hope the components pick stuff from the store.
        */
		if (newState.nav.room) handleRoomChange(newState);
		if (newState.nav.textRange) handleTextChange(newState);
		if (newState.nav.threadRange) handleThreadChange(newState);
		next();
	});

	core.on("init-dn", function(init, next) {
		var entities = {};
		init.occupantOf.forEach(function(e) {
			entities[e.id] = e;
			entities[e.id + "_" + init.user.id] = {
				room: e.id,
				user: init.user.id,
				status: "online"
			};
		});

		init.memberOf.forEach(function(e) {
			if (!entities[e.id]) entities[e.id] = e;
			if (entities[e.id + "_" + init.user.id]) {
				entities[e.id + "_" + init.user.id].role = e.role;
			} else {
				entities[e.id + "_" + init.user.id] = {
					room: e.id,
					user: init.user.id,
					status: "offline",
					role: e.role
				};
			}
		});
		core.emit("setState", {
			entities: entities
		});
		next();
	}, 1000);
};

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

function loadOccupants(roomId) {
	core.emit("getUsers", {
		occupantOf: roomId
	}, function(err, data) {
		var entities = {};
		data.results.forEach(function(e) {
			var relation = {
				user: e.id,
				room: roomId,
				status: "online",
			};

			relationsProps.forEach(function(key) {
				if (relation[key]) {
					relation[key] = e[key];
					delete e[key];
				}
			});
			entities[e.id] = e;
			entities[roomId + "_" + e.id] = relation;
		});
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
		data.results.forEach(function(e) {
			var relation = {
				user: e.id,
				room: roomId
			};
			
			relationsProps.forEach(function(key) {
				if (relation[key]) {
					relation[key] = e[key];
					delete e[key];
				}
			});

			entities[e.id] = e;
			entities[roomId + "_" + e.id] = relation;
		});
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
		if(roomId.indexOf(":")<0 && !store.getRelatedUsers(roomId).length) {
			loadMembers(roomId);
			loadOccupants(roomId);
		}
	} else {
		newState.entities[roomId] = roomObj;
	}
}
function textResponse(err, texts) {
	var updatingState = {}, range = {}, key = texts.to;

	if(texts.thread) key+="_"+texts.thread;

	if(!err && texts.results){
		if(texts.before){
			range.end = texts.time;
			range.start = texts.results[0].time;
		}else{
			range.start = texts.time;
			range.end = texts.results[texts.results.length -1].time;
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
		thread = (newState.nav.thread?newState.nav.thread : store.getNav("thread")),
		roomId = (newState.nav.room?newState.nav.room : store.getNav("room")),
		time = textRange.time || null, ranges = [];

	if(textRange.above) ranges.push(store.getTexts(roomId, thread, time, textRange.above));
	if(textRange.below) ranges.push(store.getTexts(roomId, thread, time, -textRange.below));

	ranges.forEach(function(r) {
		if(r[0] == "missing") {
			core.emit("getTexts", {
				to: roomId,
				thread: thread,
				time:time,
				before: 256
			}, textResponse);
		}
		if(r[r.length - 1] == "missing") {
			core.emit("getTexts", {
				to: roomId,
				thread: thread,
				time: r.length>=2?r.length-2 : textRange.time,
				after: 256
			}, textResponse);
		}
	});
}

function threadResponse(err, threads) {
	var updatingState = {}, range = {};

	if(!err && threads.results){
		if(threads.before) {
			range.end = threads.time;
			range.start = threads.results[0].time;
		}else{
			range.start = threads.time;
			range.end = threads.results[threads.results.length -1].time;
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
		roomId = (newState.nav.room?newState.nav.room : store.getNav("room")),
		time = threadRange.time || null, ranges = [];
	
	
	if(threadRange.above) ranges.push(store.getTexts(roomId, time, threadRange.above));
	if(threadRange.below) ranges.push(store.getTexts(roomId, time, -threadRange.below));

	ranges.forEach(function(r) {
		if(r[0] == "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: time,
				before: 256
			}, threadResponse);
		}
		if(r[r.length - 1] == "missing") {
			core.emit("getThreads", {
				to: roomId,
				time: r.length>=2?r.length-2 : threadRange.time,
				after: 256
			}, threadResponse);
		}
	});
}