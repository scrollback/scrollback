var store, core, config;
var entityOps = require("./entity-ops.js");
var relationsProps = require("./property-list.js").relations;
var pendingActions = {};
module.exports = function(c, conf, s) {
	store = s;
	core = c;
	config = conf;

	function constructEntitiesFromRoomList(list, entities, userId) {
		list.forEach(function(e) {
			var relation = {}, entity = {};
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
	key = keyFromText(text);
	newState.texts[text.to] = [textRange];
	newState.texts[key] = [textRange];
	core.emit("setstate", newState);

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

function onTextDn(text, next) {
	var textRange = {
			start: text.time,
			end: null,
			items: [text]
		}, oldRange,
		key, newState = {texts:{}}, oldKey = "";

	key = keyFromText(text);
	
	newState.texts[text.to] = [textRange];
	newState.texts[key] = [textRange];
	if (pendingActions[text.id]) {
		oldKey = keyFromText(pendingActions[text.id]);
		if(!newState.texts[oldKey]) newState.texts[oldKey] = [];
		oldRange = {
			start: pendingActions[text.id].time,
			end: pendingActions[text.id].time,
			items: [

			]
		};
		newState.texts[text.to].push(oldRange);
		if(pendingActions[text.id].to !== oldKey) newState.texts[oldKey].push(oldRange);
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




