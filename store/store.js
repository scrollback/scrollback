var objUtils = require("../lib/obj-utils.js");
var generate = require("../lib/generate.js");
var state = {
    "nav": {
        "mode": "loading",
        "view": "main",
        "room": null
    },
    session:{
    },
    "user": {
    },
    "texts": {},
    "threads": {},
    entities:{},
    indexes:{
        textsById:{},
        threadsById:{},
        roomUsers:{},
        userRooms:{}
    }
};

module.exports = function(core, config) {
	var store = {};
    store.get = get;
    
	store.getApp = getProp("app");
    store.getNav = getProp("nav");
	store.getContext = getProp("context");
	
	store.getRooms = getEntities;
    store.getUsers = getEntities;
    
	store.getTexts = function(roomid) {
        var res = [];
        for(var i =0;i<100;i++) {
            res.push(createText(roomid));
        }
        res.sort(function(a,b) {
            return a-b;
        });
        return res;
    };
    
	store.getEntity = getEntities;
    
	store.getThreads = function(roomid) {
        var res = [];
        for(var i =0;i<100;i++) {
            res.push(createThread(roomid));
        }
        res.sort(function(a,b) {
            return a-b;
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
		if(property) args.push(property);
		return this.get.apply(this, args);
	};
}

function getRelatedUsers(id, filter) {
	var user;
	if(typeof id == "string") {
		user = id;
	}else if(typeof id === "object") {
		user = this.get("user", "id");
		filter = id;
	}
}

function getFeaturedRooms() {
	var rooms = this.getApp("featuredRooms"), result;
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
	var room;
	if(typeof id == "string") {
		if(id === "featured") {
			return getFeaturedRooms();
		} else if(id === "recommended") {
			return getRecommendedRooms();
		}else{
			room = id;
		}
	}else if(typeof id === "object") {
		room = this.getNav("room");
		filter = id;
	}
	
//	returnRelatedRooms(room, filter);
}


function createThread() {
    var time = new Date().getTime() - 1000000;
    var threads = {
        id: generate.uid(),
        title: generate.sentence(((Math.random() + 1) * 10 )| 0),
        startTime: time + (((Math.random() + 1) * 10000 )| 0)
    };
    createText();
    return threads;
}


function createText(room) {
    var time = new Date().getTime() - 1000000;
    var action = {
        id: generate.uid(),
        to: room,
        type:"text",
        threads:[{
            id:generate.uid(),
            title: generate.sentence(((Math.random() + 1) * 10 )| 0),
            startTime: time + (((Math.random() + 1) * 10000 )| 0)
        }],
        from: generate.names(12),
        text: generate.sentence(((Math.random() + 1) * 10 )| 0),
        time: time + (((Math.random() + 1) * 10000 )| 0)
    };
    return action;
}

function getEntities() {
	var roomId;
	if(arguments.length === 0) roomId = this.get("nav", "room");
	else roomId = arguments[0];
	
	if(roomId.indexOf(":") >= 0){
		// get room based on id.
	}else if(roomId){
		return this.get("entities", roomId);
	}
}