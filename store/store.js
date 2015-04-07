var objUtils = require("../lib/obj-utils.js"),
	rangeOps = require("./range-ops.js"),
	state = {
		"nav": {
			"mode": "loading",
			"view": "main",
			"room": null
		},
		session: "",
		user: "",
		texts: {},
		threads: {},
		entities: {},
		context: {},
		app: {
			listeningRooms: []
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
	var value, arr,
		args = [].slice.call(arguments);

	for (var i = this._objs.length, l = 0; i > l; i--) {
		arr = args.slice(0);

		arr.unshift(this._objs[i - 1]);

		value = objUtils.get.apply(null, arr);

		if (typeof value !== "undefined") {
			return objUtils.clone(value);
		}
	}
};

Store.prototype.with = function(obj) {
	var objs = this._objs.slice(0);

	objs.push(obj);

	return new Store(objs);
};

Store.prototype.getEntity = function(id) {
	return this.get("entities", id) || "unknown";
};

Store.prototype.getUser = function(id) {
	return this.getEntity(id || this.get("user"));
};

Store.prototype.getRoom = function(id) {
	return this.getEntity(id || this.get("nav", "room"));
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
	var user, rooms, self = this;

	if (typeof id === "string") {
		user = id;
	} else {
		user = this.get("user");

		if (typeof id === "object") {
			filter = id;
		}
	}

	rooms = this.get("indexes", "userRooms", user);

	if (rooms) {
		rooms = rooms.filter(function(roomRelation) {
			var roomObj, filterKeys, i;
			if (filter) {
				filterKeys = Object.keys(filter);
				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] !== roomRelation[filterKeys]) {
						return false;
					}
				}
			}

			roomObj = self.getRoom(roomRelation.room);

			objUtils.extend(roomRelation, roomObj);

			return true;
		});

	}
	if (rooms) {
		return rooms;
	} else {
		return [];
	}
};

Store.prototype.getRelatedUsers = function(id, filter) {
	var roomId, users, self = this;

	if (typeof id === "string") {
		roomId = id;
	} else if (typeof id === "object") {
		roomId = this.get("nav", "room");
		filter = id;
	} else {
		roomId = this.get("nav", "room");
	}

	users = this.get("indexes", "roomUsers", roomId);
	if (users) {
		users = users.filter(function(relation) {
			var userObj, filterKeys, i;

			if (filter) {
				filterKeys = Object.keys(filter);

				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] !== relation[filterKeys]) {
						return false;
					}
				}
			}

			userObj = self.getUser(relation.user);
			objUtils.extend(relation, userObj);

			return true;
		});
	}

	if (users) {
		return users;
	} else {
		return [];
	}
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

module.exports = function(core, config) {
	var store = new Store([ state ]);

	require("./state-manager.js")(core, config, store, state);
	require("./action-handler.js")(core, config, store, state);
	require("./rule-manager.js")(core, config, store, state);
	require("./socket.js")(core, config, store, state);
	require("./session-manager.js")(core, config, store, state);
	require("./guest-params-handler.js")(core, config, store, state);

	return store;
};
