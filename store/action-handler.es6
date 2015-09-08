"use strict";

var store, core,
	entityOps = require("./entity-ops.js"),
	objUtils = require("../lib/obj-utils.js"),
	userUtils = require("../lib/user-utils.js"),
	generate = require("../lib/generate.browser.js"),
	pendingActions = {},
	timeAdjustment = 0;

function entitiesFromRooms(list, entities, userId) {
	list.forEach(function(e) {
		var rkey = e.id + "_" + userId,
			relation, entity;

		relation = entityOps.relatedEntityToRelation(e, {
			id: userId,
			type: "user"
		});
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
	} else if (text.threads && text.threads.length > 0 && text.threads[0] && text.threads[0].id) {
		key = key + "_" + text.threads[0].id;
	}

	return key;
}

function threadFromText(text) {
	return {
		id: text.thread,
		from: text.from,
		to: text.to,
		startTime: text.time,
		color: text.color,
		tags: null,
		title: text.title,
		updateTime: text.time,
		updater: text.from
	};
}

function onInit(init, next) {
	var entities = {},
		newstate = {};

	if (init.response) {

		if (
			init.user.identities.filter(ident => ident.split(":")[0] === "mailto").length > 0 &&
			userUtils.isGuest(init.user.id)
		) {
			newstate.nav = newstate.nav || {};
			newstate.nav.dialogState = newstate.nav.dialogState || {};
			newstate.nav.dialogState.signingup = true;
		}


		init.user = init.user || {};
		init.user.type = "user";

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

	core.emit("getRooms", {
		featured: true
	}, function(err, rooms) {
		var featuredRooms = [],
			roomObjs = {};

		if (rooms && rooms.results) {
			rooms.results.forEach(function(e) {
				if (e) {
					featuredRooms.push(e.id);
					roomObjs[e.id] = e;
				}


			});
		}
		core.emit("setstate", {
			app: {
				featuredRooms: featuredRooms
			},
			entities: roomObjs
		});
	});
	next();
}

function onRoomUser(action, next) {
	var changes = {},
		entities = {},
		currentUser = store.getUser();

	entities[action.to] = action[action.type === "room" ? "room" : "user"];
	changes.entities = entities;

	if (action.type === 'room' && action.from === currentUser.id) {
		changes.entities[action.to + "_" + currentUser.id] = {
			room: action.to,
			user: currentUser.id,
			role: "owner"
		};
	}
	core.emit("setstate", changes);
	next();
}

function onAwayBack(action, next) {
	var entities = {},
		relation;

	if (!action.room) action.room = store.getRoom(action.to);
	if (!action.user) action.user = store.getRoom(action.from);

	entities[action.to] = entityOps.relatedEntityToEntity(action.room || {});
	entities[action.from] = entityOps.relatedEntityToEntity(action.user || {});

	relation = entityOps.relatedEntityToRelation(entities[action.to], {
		id: action.from,
		type: "user"
	});
	relation.status = action.type === "away" ? "offline" : "online";

	entities[relation.room + "_" + relation.user] = relation;

	core.emit("setstate", {
		entities: entities
	});

	// TODO: start thread and text ranges in this room with start: current timestamp, end: null, items: []
	// for each thread already here

	next();
}

function onTextUp(text) {
	var newState = {
			texts: {}
		},
		currentTexts = store.get("texts", text.to);

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
	let oldRange,
		currentThreads, currentTexts,
		oldKey = "",
		newState = {
			texts: {}
		};

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

		text.concerns = [];

		if (!userUtils.isGuest(text.from)) {
			text.concerns.push(text.from);
		}

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

function onEdit(edit, next) {
	var text, thread, currentThread, changes = {},
		pleb = !store.isUserAdmin();

	text = edit.old;

	if (text) {
		if (text.id === text.thread) {
			currentThread = store.get("indexes", "threadsById", text.id);

			text.color = currentThread ? currentThread.color : text.color;
			text.concerns = currentThread ? currentThread.concerns : text.concerns;

			thread = threadFromText(text);
		}

		if (edit.tags) text.tags = edit.tags;
		if (edit.text) text.text = edit.text;

		changes.texts = changes.texts || {};
		changes.texts[keyFromText(text)] = changes.texts[text.to] = [{
			start: text.time,
			end: text.time,
			items: pleb && text.tags.indexOf("hidden") >= 0 ? [] : [text]
		}];
	}

	if (thread) {
		if (edit.tags) thread.tags = edit.tags;
		if (edit.title) thread.title = edit.title;

		changes.threads = changes.threads || {};
		changes.threads[thread.to] = [{
			start: thread.startTime,
			end: thread.startTime,
			items: pleb && thread.tags.indexOf("thread-hidden") >= 0 ? [] : [thread]
		}];
	}
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
	relation.role = join.role || (join.type === 'join' ? 'follower' : null);
	if (relation.role === 'none') relation.role = null;
	if (join.type === 'join') {
		if (join.transitionType) relation.transitionType = join.transitionType;
		if (join.transitionRole) relation.transitionRole = join.transitionRole;
	} else {
		relation.transitionRole = null;
		relation.transitionType = null;
	}
	entities[roomObj.id] = entityOps.relatedEntityToEntity(roomObj);
	entities[userObj.id] = entityOps.relatedEntityToEntity(userObj);
	entities[roomObj.id + "_" + userObj.id] = relation;

	core.emit("setstate", {
		entities: entities
	});
	return next();
}


function onAdmitDn(action) {
	var roomObj = action.room;
	var victim = action.victim;
	var relation = {},
		entities = {},
		newState, roomId;

	relation.user = victim.id;
	relation.room = roomObj.id;
	relation.role = action.role ? action.role : victim.role;
	relation.transitionRole = action.transitionRole ? action.transitionRole : null;
	relation.transitionType = action.transitionType ? action.transitionType : null;

	entities[roomObj.id] = entityOps.relatedEntityToEntity(roomObj);
	entities[victim.id] = entityOps.relatedEntityToEntity(victim);
	entities[roomObj.id + "_" + victim.id] = relation;

	newState = {
		entities: entities
	};

	roomId = store.get("nav", "room");
	if (roomId === roomObj.id) {
		newState.nav = {
			room: roomId
		};
	}

	core.emit("setstate", newState);
}

module.exports = function(c, conf, s) {
	store = s;
	core = c;

	core.on("admit-dn", onAdmitDn, 950);
	core.on("expel-dn", onAdmitDn, 950);
	core.on("init-dn", onInit, 950);
	core.on("join-dn", onJoinPart, 950);
	core.on("part-dn", onJoinPart, 950);
	core.on("edit-dn", onEdit, 950);
	core.on("text-up", onTextUp, 950);
	core.on("text-dn", onTextDn, 950);
	core.on("away-dn", onAwayBack, 950);
	core.on("back-dn", onAwayBack, 950);
	core.on("room-dn", onRoomUser, 950);
	core.on("user-dn", onRoomUser, 950);

	core.on("error-dn", function(error, next) {
		var newState = {
			texts: {}
		};
		var text = store.get("indexes", "textsById", error.id);
		if (text) {
			text = objUtils.clone(text);

			(text.tags = text.tags ? text.tags : []).push("failed");

			newState.texts[text.to] = [{ // put the text in all messages
				start: text.time,
				end: text.time,
				items: [text]
			}];

			if (text.thread) {
				newState.texts[keyFromText(text)] = [{ // put the text in the appropriate thread
					start: text.time,
					end: (text.thread === text.id) ? null : text.time,
					items: [text]
				}];
			}


			core.emit("setstate", newState);
			error.handled = true;
		}

		next();
	}, 1000);
	[
		"text-up", "edit-up", "back-up", "away-up", "init-up",
		"join-up", "part-up", "admit-up", "expel-up", "room-up"
	].forEach(function(event) {
		core.on(event, function(action) {
			if (!action.id) {
				action.id = generate.uid();
			}
			if (!action.time) {
				action.time = Date.now() + timeAdjustment;
			}
		}, 1000);
	});

	["getTexts", "getUsers", "getRooms", "getThreads", "getEntities", "upload/getPolicy"].forEach(function(event) {
		core.on(event, function(query) {
			if (!query.id) {
				query.id = generate.uid();
			}
		}, 1000);
	});

	[
		"text-dn", "edit-dn", "back-dn", "away-dn", "init-dn",
		"join-dn", "part-dn", "admit-dn", "expel-dn", "room-dn"
	].forEach(function(event) {
		core.on(event, function(action) {
			timeAdjustment = action.time - Date.now();
		}, 1000);
	});
};
