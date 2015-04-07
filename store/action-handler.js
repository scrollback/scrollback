var store, core, config;
var entityOps = require("./entity-ops.js");
//var relationsProps = require("./property-list.js").relations;
var pendingActions = {};
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	core.on("init-dn", onInit, 1000);
	core.on("join-dn", onJoinPart, 1000);
	core.on("part-dn", onJoinPart, 1000);
	core.on("edit-dn", onEdit, 1000);
	core.on("text-up", onTextUp, 1000);
	core.on("text-dn", onTextDn, 1000);
	core.on("away-dn", onAwayBack, 1000);
	core.on("back-dn", onAwayBack, 1000);
	core.on("room-dn", onRoomUser, 1000);
	core.on("user-dn", onRoomUser, 999);
};

function entitiesFromRooms(list, entities, userId) {
	list.forEach(function(e) {
		var rkey = e.id + "_" + userId,
			relation = entities[rkey] || {},
			entity = entities[e.id] || {};

		relation = entityOps.relatedEntityToRelation(e, {id:userId,type:"user"});
		entity = entityOps.relatedEntityToEntity(e);
		entities[e.id] = entity;
		entities[rkey] = relation;
	});

	return entities;
}

function keyFromText(text) {
	var key = text.to;
	if (text.thread) {
		key = key + "_" + text.thread;
	} else if(text.threads && text.threads.length > 0 && text.threads[0] && text.threads[0].id) {
		key = key + "_" + text.threads[0].id;
	}

	return key;
}

function onInit(init, next) {
	var entities = {};
	var newstate = {};
	if(init.response) {
		switch(init.response.message) {
			case "AUTH:UNREGISTRED":
				newstate.nav = newstate.nav || {};
				newstate.nav.dialogState = newstate.nav.dialogState || {};
				newstate.nav.dialogState.signingup = true;

				break;
		}
	}

	if (!init.user.id) {
		entities[store.get("user")] = init.user;
		newstate.entities = entities;
		core.emit("setstate", newstate);
		return next();
	}

	if (init.occupantOf) entities = entitiesFromRooms(init.occupantOf, entities, init.user.id);
	if (init.memberOf) entities = entitiesFromRooms(init.memberOf, entities, init.user.id);
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
}

function onRoomUser(action, next) {
	var entities = {};
	entities[action.to] = action[action.type == "room" ? "room" : "user"];
	core.emit("setstate", {
		entities: entities
	});
	next();
}

function onAwayBack(action, next) {
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
			end: text.time,
			items: [text]
		},
		key, newState = {texts:{}};
	next(); // calling next here so that it gets an id.
	pendingActions[text.id] = text;
	key = keyFromText(text);
	newState.texts[text.to] = [textRange];
	newState.texts[key] = [textRange];

//	next();

//	Optimistically adding new threads is made complex
//	by the unavailability of an id on the text-up.
//	if(text.thread == text.id) {
//		newState.threads = {};
//		newState.threads[text.to] = [{
//			start: text.time, end: null, items: [{
//				id: text.id, from: text.from, to: text.to,
//				startTime: text.time, color: -1, tags: null,
//				title: text.title, updateTime: text.time,
//				updater: text.from
//			}]
//		}];
//	}

	core.emit("setstate", newState);

}

function onTextDn(text, next) {
	var textRange = {
			start: text.time,
			end: ((text.thread === text.id)?null: text.time),
			items: [text]
		}, oldRange,
		key, newState = {texts:{}}, oldKey = "";

	key = keyFromText(text);

	newState.texts[text.to] = [textRange];
	newState.texts[key] = [textRange];
	if (pendingActions[text.id]) {
		oldRange = {
			start: pendingActions[text.id].time,
			end: pendingActions[text.id].time,
			items: []
		};
		newState.texts[text.to].push(oldRange);

		oldKey = keyFromText(pendingActions[text.id]);
		if(!newState.texts[oldKey]) newState.texts[oldKey] = [];
		if(pendingActions[text.id].to !== oldKey) newState.texts[oldKey].push(oldRange);
		delete pendingActions[text.id];
	}

	if(text.thread === text.id) {
		newState.threads = {};
		newState.threads[text.to] = [{
			start: text.time, end: text.time, items: [{
				id: text.thread, from: text.from, to: text.to,
				startTime: text.time, color: text.color, tags: null,
				title: text.title, updateTime: text.time,
				updater: text.from
			}]
		}];
	}

	// TODO? If text.title exists, change title of thread.

	core.emit("setstate", newState);
	next();
}

function onEdit (editDn, next) {
	var newText = editDn.old, textRange, key, newState;
	newText.tags = editDn.tags;

	textRange = {
		start: newText.time,
		end: newText.time,
		items: [newText]
	};

	key = keyFromText(newText);
	newState = {
		texts:{}
	};

	newState.texts[newText.to] = [textRange];
	newState.texts[key] = [textRange];
	core.emit("setstate", newState);
	next();
}

function onJoinPart(join, next) {
	var room = join.room;
	var user = join.user;
	var relation = {},
		entities = {};

	relation.user = user.id;
	relation.room = room.id;
	relation.role = join.role || (join.type == 'join'? 'follower': null);
	if(relation.role == 'none') relation.role = null;

	entities[room.id] = entityOps.relatedEntityToEntity(room);
	entities[user.id] = entityOps.relatedEntityToEntity(user);
	entities[room.id + "_" + user.id] = relation;

	core.emit("setstate", {
		entities: entities
	});
	return next();
}


