"use strict";

var store, core, config,
	entityOps = require("./entity-ops.js"),
	objUtils = require("../lib/obj-utils.js"),
	pendingActions = {},
	user;

module.exports = function(c, conf, s) {
	user = require("../lib/user.js")(c, conf, s);

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

function threadFromText(text) {
	return {
		id: text.thread, from: text.from, to: text.to,
		startTime: text.time, color: text.color, tags: null,
		title: text.title, updateTime: text.time,
		updater: text.from
	};
}

function onInit(init, next) {
	var entities = {};
	var newstate = {};
	if(init.response) {
		switch(init.response.message) {
			case "AUTH:UNREGISTERED":
				newstate.nav = newstate.nav || {};
				newstate.nav.dialogState = newstate.nav.dialogState || {};
				newstate.nav.dialogState.signingup = true;

				break;
		}
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
	var changes = {},
		entities = {};

	entities[action.to] = action[action.type === "room" ? "room" : "user"];
	changes.entities = entities;

	core.emit("setstate", changes);
	next();
}

function onAwayBack(action, next) {
	var entities = {}, relation;
	if(!action.room) action.room = store.getRoom(action.to);
	if(!action.user) action.user = store.getRoom(action.from);

	entities[action.to] = entityOps.relatedEntityToEntity(action.room || {});
	entities[action.from] = entityOps.relatedEntityToEntity(action.user || {});
	relation = entityOps.relatedEntityToRelation(entities[action.to], {id:action.from, type:"user"});
	relation.status = action.type === "away" ? "offline" : "online";

	entities[relation.room + "_" + relation.user] = relation;
	core.emit("setstate", {
		entities: entities
	});

	// TODO: start thread and text ranges in this room with start: current timestamp, end: null, items: []
	// for each thread already here

	next();
}

function onTextUp(text, next) {
	var newState = { texts: {} },
		currentTexts = store.get("texts", text.to);

	next(); // calling next here so that it gets an id.

	pendingActions[text.id] = text;

	text = objUtils.clone(text);

	newState.texts[text.to] = [{ // put the text in all messages
		start: text.time,
		end: (currentTexts && currentTexts.length) ? text.time : null,
		items: [text]
	}];

	if (text.thread) {
		newState.texts[keyFromText(text)] = [{ // put the text in the appropriate thread
			start: text.time,
			end: (text.thread !== text.id) ? text.time : null,
			items: [text]
		}];
	}

//	next();

//	Optimistically adding new threads is made complex
//	by the unavailability of an id on the text-up.
//	if(text.thread === text.id) {
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
	var oldRange,
		currentThreads, currentTexts,
		oldKey = "", newState = { texts: {} };

	currentTexts = store.get("texts", text.to);

	newState.texts[text.to] = [{ // put the text in all messages
		start: text.time,
		end: (currentTexts && currentTexts.length) ? text.time : null,
		items: [text]
	}];

	if (text.thread) {
		newState.texts[keyFromText(text)] = [{ // put the text in the appropriate thread
			start: text.time,
			end: (text.thread === text.id) ? null : text.time,
			items: [text]
		}];
	}

	if (pendingActions[text.id]) {
		oldRange = {
			start: pendingActions[text.id].time,
			end: pendingActions[text.id].time,
			items: []
		};

		newState.texts[text.to].push(oldRange);

		oldKey = keyFromText(pendingActions[text.id]);

		if (!newState.texts[oldKey]) newState.texts[oldKey] = [];
		if (pendingActions[text.id].to !== oldKey) newState.texts[oldKey].push(oldRange);

		delete pendingActions[text.id];
	}

	if (text.thread === text.id) {
		currentThreads = store.get("threads", text.to);

		newState.threads = {};
		newState.threads[text.to] = [{
			start: text.time,
			end: (currentThreads && currentThreads.length) ? text.time : null,
			items: [threadFromText(text)]
		}];
	}

	// TODO? If text.title exists, change title of thread.

	core.emit("setstate", newState);
	next();
}

function onEdit (edit, next) {
	var text, thread, changes = {},
		pleb = !user.isAdmin();

	text = edit.old;

	if(text) {
		text.color = edit.color; // Extremely ugly hack to bring color info that's not part of the text object
		thread = text.id === text.thread? threadFromText(text): null;

		if(edit.tags) text.tags = edit.tags;
		if(edit.text) text.text = edit.text;
		changes.texts = changes.texts || {};
		changes.texts[keyFromText(text)] = changes.texts[text.to] = [{
			start: text.time, end: text.time,
			items: pleb && text.tags.indexOf("hidden")>=0? []: [text]
		}];
	}

	if(thread) {
		if(edit.tags) thread.tags = edit.tags;
		if(edit.title) thread.title = edit.title;
		changes.threads = changes.threads || {};
		changes.threads[thread.to] = [{
			start: thread.startTime, end: thread.startTime,
			items: pleb && thread.tags.indexOf("thread-hidden")>=0? []: [thread]
		}];
	}

	console.log("edit change", edit, text, thread, changes);

	core.emit("setstate", changes);
	next();
}

function onJoinPart(join, next) {
	var roomObj = join.room;
	var userObj = join.user;
	var relation = {},
		entities = {};

	relation.user = userObj.id;
	relation.room = roomObj.id;
	relation.role = join.role || (join.type === 'join'? 'follower': null);
	if(relation.role === 'none') relation.role = null;

	entities[roomObj.id] = entityOps.relatedEntityToEntity(roomObj);
	entities[userObj.id] = entityOps.relatedEntityToEntity(userObj);
	entities[roomObj.id + "_" + userObj.id] = relation;

	core.emit("setstate", {
		entities: entities
	});
	return next();
}

