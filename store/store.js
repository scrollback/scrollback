var objUtils = require("../lib/obj-utils.js");
var rangeOps = require("./range-ops.js");
var state = {
	"nav": {
		"mode": "loading",
		"view": "main",
		"room": null
	},
	session: {},
	"user": {},
	"texts": {},
	"threads": {},
	entities: {},
	context:{},
	app:{},
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

	store.getRoom = getEntities;
	store.getUser = getEntities;

	store.getTexts = function(roomId, threadId, time, range) {
		var req = {time:time || new Date().getDate()};
		if(range <0) req.below = range * -1;
		else req.above = range;
		return rangeOps.getItems(state.texts[roomId][threadId], req, "time");
	};

	store.getEntity = getEntities;

	store.getThreads = function(roomId, time, range) {
		var req = {startTime:time || new Date().getDate()};
		if(range <0) req.below = range * -1;
		else req.above = range;
		return rangeOps.getItems(state.threads[roomId], req, "startTime");
	};

	store.getRelatedRooms = getRelatedRooms;
	store.getRelatedUsers = getRelatedUsers;

	require("./state-manager.js")(core, config, store, state);
	return store;
};



function get() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(state);
	return objUtils.get.apply(null, args);
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
	}
	
	users = this.get("indexes", "roomUsers", roomId);
	users = users.filter(function(relation) {
		var userObj, filterKeys, i;
		if(filter) {
			filterKeys = Object.keys(filter);
			for(i = 0; i<filterKeys.length; i++) {
				if(filter[filterKeys] != relation[filterKeys]) return false;
			}
		}
		
		userObj = self.getUser(relation.user);
		objUtils.extend(userObj, relation);
		return true;
	});
	
	return users;
}

function getFeaturedRooms() {
	var rooms = this.getApp("featuredRooms"),
		result;
	var user = this.get("user", "id");

	rooms.forEach(function(room) {
		var roomObj = this.getRoom(room, user);
		result.push(roomObj);
	});

	return result;
}

function getRecommendedRooms() {

}

function getRelatedRooms(id, filter) {
	var user, rooms, self = this;
	if (typeof id == "string") {
		if (id === "featured") {
			return getFeaturedRooms();
		} else if (id === "recommended") {
			return getRecommendedRooms();
		} else {
			user = id;
		}
	} else if (typeof id === "object") {
		user = this.getNav("user").id;
		filter = id;
	}
	rooms = this.get("indexes", "userRooms", user);
	rooms = rooms.filter(function(roomRelation) {
		var roomObj, filterKeys, i;
		if(filter) {
			filterKeys = Object.keys(filter);
			for(i = 0; i<filterKeys.length; i++) {
				if(filter[filterKeys] != roomRelation[filterKeys]) return false;
			}
		}
		roomObj = self.getRoom(roomRelation.room);
		objUtils.extend(roomRelation, roomObj);
		return true;
	});
	
	return rooms;
}

function getEntities() {
	var roomId;
	if (arguments.length === 0) roomId = this.get("nav", "room");
	else roomId = arguments[0];

	if (roomId.indexOf(":") >= 0) {
		// get room based on id.
	} else if (roomId) {
		return this.get("entities", roomId);
	}
}