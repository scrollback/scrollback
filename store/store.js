"use strict";

var permissionWeights = require("../authorizer/permissionWeights.js"),
	userUtils = require("../lib/user-utils.js"),
	objUtils = require("../lib/obj-utils.js"),
	rangeOps = require("../lib/range-ops.js"),
	state = {
		"nav": {
			"mode": "loading",
			"view": null,
			"room": null,
			"dialog": null,
			"textRange": {
				time: null,
				after: 30
			},
			"threadRange": {
				time: null,
				after: 20
			}
		},
		session: "",
		user: "",
		notes: [],
		texts: {},
		threads: {},
		entities: {},
		context: {},
		app: {
			listeningRooms: [],
			connectionStatus: "connecting"
		},
		indexes: {
			threadsById: {},
			textsById: {},
			roomUsers: {},
			userRooms: {}
		}
	};

function Store(objs) {
	// Handle situation where called without "new" keyword
	if (false === (this instanceof Store)) {
		throw new Error("Must be initialized before use");
	}

	// Throw error if not given an array as argument
	if (!Array.isArray(objs)) {
		throw new Error("Invalid array " + objs);
	}

	this._objs = objs;
}

Store.prototype.get = function() {
	var args = Array.prototype.slice.call(arguments),
		value, arr;

	for (var i = this._objs.length, l = 0; i > l; i--) {
		arr = args.slice(0);

		arr.unshift(this._objs[i - 1]);

		value = objUtils.get.apply(null, arr);

		if (typeof value !== "undefined") {
			return value;
		}
	}
};

Store.prototype.with = function(obj) {
	var objs = this._objs.slice(0);

	objs.push(obj);

	return new Store(objs);
};

Store.prototype.getEntity = function(id) {
	return this.get("entities", id);
};

Store.prototype.getUser = function(id) {
	var userObj = this.getEntity(id || this.get("user"));

	if (typeof userObj === "object") {
		if (userObj.type === "user") {
			return userObj;
		}
	} else {
		return userObj;
	}
};

Store.prototype.getRoom = function(id) {
	var roomObj = this.getEntity(id || this.get("nav", "room"));

	if (typeof roomObj === "object") {
		if (roomObj.type === "room") {
			return roomObj;
		}
	} else {
		return roomObj;
	}
};

Store.prototype.getTexts = function(roomId, threadId, time, range) {
	var req = { time: time || null },
		key = roomId + (threadId ? "_" + threadId : ""),
		texts = this.get("texts");

	if (range < 0) {
		req.before = range * -1;
	} else {
		req.after = range;
	}

	if (!(texts && texts[key])) {
		return ['missing'];
	}

	return rangeOps.getItems(texts[key], req, "time");
};

Store.prototype.getThreads = function(roomId, time, range) {
	var req = { startTime: time || null },
		threads = this.get("threads");

	if (range < 0) {
		req.before = range * -1;
	} else {
		req.after = range;
	}

	if (!(threads && threads[roomId])) {
		return ["missing"];
	}

	return rangeOps.getItems(threads[roomId], req, "startTime");
};

Store.prototype.getRelation = function(roomId, userId) {
	roomId = roomId || this.get("nav", "room");
	userId = userId || this.get("user");

	return this.get("entities", roomId + "_" + userId);
};

Store.prototype.getRelatedRooms = function(id, filter) {
	var user, relations,
		rooms = [],
		self = this;

	if (typeof id === "string") {
		user = id;
	} else {
		user = this.get("user");

		if (typeof id === "object") {
			filter = id;
		}
	}

	relations = this.get("indexes", "userRooms", user);

	if (Array.isArray(relations)) {
		relations.forEach(function(roomRelation) {
			var roomObj, filterKeys, i;

			if (filter) {
				filterKeys = Object.keys(filter);
				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] !== roomRelation[filterKeys]) {
						return;
					}
				}
			}

			roomObj = self.getRoom(roomRelation.room);

			rooms.push(objUtils.merge(objUtils.clone(roomRelation), roomObj));
		});

	}

	return rooms;
};

Store.prototype.getRelatedUsers = function(id, filter) {
	var roomId, relations,
		users = [],
		self = this;

	if (typeof id === "string") {
		roomId = id;
	} else if (typeof id === "object") {
		roomId = this.get("nav", "room");

		filter = id;
	} else {
		roomId = this.get("nav", "room");
	}

	relations = this.get("indexes", "roomUsers", roomId);

	if (Array.isArray(relations)) {
		relations.forEach(function(relation) {
			var userObj, filterKeys, i;

			if (filter) {
				filterKeys = Object.keys(filter);

				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] !== relation[filterKeys]) {
						return;
					}
				}
			}

			userObj = self.getUser(relation.user);

			users.push(objUtils.merge(objUtils.clone(relation), userObj));
		});
	}

	return users;
};

Store.prototype.getRecommendedRooms = function getRecommendedRooms() {
	// TODO: right now no recommended rooms
	return [];
};

Store.prototype.getFeaturedRooms = function() {
	var rooms = this.get("app", "featuredRooms"),
		self = this;

	if (!rooms) {
		return [];
	}

	return rooms.map(function(room) {
		return self.getRoom(room);
	});
};

Store.prototype.getUserRole = function(userId, roomId) {
	var rel, role;

	userId = (typeof userId === "string") ? userId : this.get("user");

	rel = this.getRelation(roomId, userId);

	if (rel && rel.role && rel.role !== "none") {
		role = rel.role;
	} else {
		role = (!userId || userUtils.isGuest(userId)) ? "guest" : "registered";
	}

	return role;
};

Store.prototype.isUserAdmin = function(userId, roomId) {
	var rel, role;

	userId = (typeof userId === "string") ? userId : this.get("user");

	rel = this.getRelation(roomId, userId);

	if (rel && rel.role && rel.role !== "none") {
		role = rel.role;
	} else {
		role = (!userId || userUtils.isGuest(userId)) ? "guest" : "registered";
	}

	return role;
};

Store.prototype.isRoomReadable = function(roomId, userId) {
	var roomObj = this.getRoom(roomId),
		readLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
					 roomObj.guides.authorizer.readLevel) ? roomObj.guides.authorizer.readLevel : "guest";

	return (permissionWeights[this.getUserRole(userId, roomId)] >= permissionWeights[readLevel]);
};

Store.prototype.isRoomWritable = function(roomId, userId) {
	var roomObj = this.getRoom(roomId),
		writeLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
					  roomObj.guides.authorizer.writeLevel) ? roomObj.guides.authorizer.writeLevel : "guest";

	return (permissionWeights[this.getUserRole(userId, roomId)] >= permissionWeights[writeLevel]);
};

module.exports = function(core, config) {
	var store = new Store([ state ]);

	require("./state-manager.es6")(core, config, store, state);
	require("./action-handler.es6")(core, config, store, state);
	require("./rule-manager.es6")(core, config, store, state);
	require("./socket.js")(core, config, store, state);
	require("./session-manager.js")(core, config, store, state);
	require("./guest-params-handler.js")(core, config, store, state);

	return store;
};
