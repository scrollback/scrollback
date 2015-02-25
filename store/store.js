var objUtils = require("../lib/obj-utils.js");
var generate = require("../lib/generate.js");
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

	store.getTexts = function(roomid) {
		var res = [];
		for (var i = 0; i < 100; i++) {
			res.push(createText(roomid));
		}
		res.sort(function(a, b) {
			return a - b;
		});
		return res;
	};

	store.getEntity = getEntities;

	store.getThreads = function(roomid) {
		var res = [];
		for (var i = 0; i < 100; i++) {
			res.push(createThread(roomid));
		}
		res.sort(function(a, b) {
			return a - b;
		});
		return res;
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
	users = users.map(function(relation) {
		var userObj = self.getUser(relation.user);
		return objUtils.extend(userObj, relation);
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
	rooms = rooms.map(function(roomRelation) {
		var roomObj = self.getRoom(roomRelation.room);
		return objUtils.extend(roomObj, roomRelation);
	});
	
	return rooms;
}


function createThread() {
	var time = new Date().getTime() - 1000000;
	var threads = {
		id: generate.uid(),
		title: generate.sentence(((Math.random() + 1) * 10) | 0),
		startTime: time + (((Math.random() + 1) * 10000) | 0)
	};
	createText();
	return threads;
}


function createText(room) {
	var time = new Date().getTime() - 1000000;
	var action = {
		id: generate.uid(),
		to: room,
		type: "text",
		threads: [{
			id: generate.uid(),
			title: generate.sentence(((Math.random() + 1) * 10) | 0),
			startTime: time + (((Math.random() + 1) * 10000) | 0)
        }],
		from: generate.names(12),
		text: generate.sentence(((Math.random() + 1) * 10) | 0),
		time: time + (((Math.random() + 1) * 10000) | 0)
	};
	return action;
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