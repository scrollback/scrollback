var objUtils = require("../lib/obj-utils.js");
var rangeOps = require("./range-ops.js");
var state = {
	"nav": {
		"mode": "loading",
		"view": "main",
		"room": null
	},
	session: "",
	"user": "",
	"texts": {},
	"threads": {},
	entities: {},
	context: {},
	app: {
		listeningRooms: []
	},
	indexes: {
		textsById: {},
		threadsById: {},
		roomUsers: {},
		userRooms: {}
	}
};

module.exports = function(core, config) {
	var store = {};
	store.get = get;

	store.getApp = getProp("app");
	store.getNav = getProp("nav");
	store.getContext = getProp("context");

	store.getRoom = getRoom;
	store.getUser = getUser;

	store.getTexts = function(roomId, threadId, time, range) {
		var req = {
				time: time || null
			},
			key = roomId + (threadId ? "_" + threadId : "");
		if (range < 0) req.before = range * -1;
		else req.after = range;
		if (!state.texts[key]) return ['missing'];

		return rangeOps.getItems(state.texts[key], req, "time");
	};

	store.getEntity = getEntities;

	store.getThreads = function(roomId, time, range) {
		var req = {
			startTime: time || null
		};
		if (range < 0) req.before = range * -1;
		else req.after = range;
		if (!state.threads[roomId]) return ["missing"];
		return rangeOps.getItems(state.threads[roomId], req, "startTime");
	};
	store.getRelation = getRelation;
	store.getRelatedRooms = getRelatedRooms;
	store.getRelatedUsers = getRelatedUsers;
	store.getRecommendedRooms = getRecommendedRooms;
	store.getFeaturedRooms = getFeaturedRooms;

	require("./state-manager.js")(core, config, store, state);
	require("./action-handler.js")(core, config, store, state);
	require("./rule-manager.js")(core, config, store, state);
	require("./socket.js")(core, config, store, state);
	require("./session-manager.js")(core, config, store, state);
	require("./guest-params-handler.js")(core, config, store, state);
	return store;
};



function get() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(state);
	return objUtils.clone(objUtils.get.apply(null, args));
}

function getProp(block) {
	return function(property) {
		var args = [block];
		if (property) args.push(property);
		return this.get.apply(this, args);
	};
}

function getRelatedUsers(id, filter) {
	var roomId, users, self = this;
	if (typeof id == "string") {
		roomId = id;
	} else if (typeof id === "object") {
		roomId = this.getNav("room");
		filter = id;
	} else {
		id = roomId = this.getNav("room");
	}

	users = this.get("indexes", "roomUsers", roomId);
	if (users) {
		users = users.filter(function(relation) {
			var userObj, filterKeys, i;
			if (filter) {
				filterKeys = Object.keys(filter);
				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] != relation[filterKeys]) return false;
				}
			}
			userObj = self.getUser(relation.user);
			objUtils.extend(relation, userObj);
			return true;
		});
	}

	if (users) return users;
	else return [];
}

function getFeaturedRooms() {
	var rooms = this.getApp("featuredRooms"),
		result = [],
		self = this;

	if (!rooms) {
		return [];
	}

	rooms.forEach(function(room) {
		var roomObj = self.getRoom(room);
		result.push(roomObj);
	});

	return result;
}

function getRecommendedRooms() {
	//TODO: right now no recommended rooms

	return [];
}

function getRelation(roomId, userId) {
	if (!roomId) roomId = this.getNav("room");
	if (!userId) userId = this.get("user");
	return this.get("entities", roomId + "_" + userId);
}

function getRelatedRooms(id, filter) {
	var user, rooms, self = this;
	if (typeof id == "string") {
		user = id;
	} else {
		user = this.get("user");
		if (typeof id === "object") filter = id;
	}

	rooms = this.get("indexes", "userRooms", user);
	if (rooms) {
		rooms = rooms.filter(function(roomRelation) {
			var roomObj, filterKeys, i;
			if (filter) {
				filterKeys = Object.keys(filter);
				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] != roomRelation[filterKeys]) return false;
				}
			}
			roomObj = self.getRoom(roomRelation.room);
			objUtils.extend(roomRelation, roomObj);
			return true;
		});

	}
	if (rooms) return rooms;
	else return [];
}

function getUser() {
	var userId, res;
	if (arguments.length === 0) userId = this.get("user");
	else userId = arguments[0];
	res = this.get("entities", userId);
	if (res) return res;
	return "missing";
}

function getRoom() {
	var roomId, res;
	if (arguments.length === 0) roomId = this.get("nav", "room");
	else roomId = arguments[0];
	if (roomId) {
		res = this.get("entities", roomId);
	}
	if (res) return res;
	else return "missing";
}

function getEntities(id) {
	var res;
	if (id) {
		res = this.get("entities", id);
	} else {
		return {};
	}

	if (res) return res;
	else return "missing";
}