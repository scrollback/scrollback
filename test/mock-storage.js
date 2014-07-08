var core = require("../test/mock-core.js")();
var rooms = {
	"scrollback": {
		id:"scrollback",
		description:"this is room",
		type:"room",
		identities:["irc://harry.scrollback.io/#scrollback"],
		timezone: 300,
		params:{}
	}
};

var users = {
	"harish":{
		id: "harish",
		description: "this is user",
		type: "user",
		identities: ["mailto:harish@scrollback.io"],
		timezone: 330,
		params: {}
	}
};

module.exports = function(c) {
	core = c;
	core.on("getRooms",function(payload, callback) {		
		if(payload.id) {
			payload.results = [];
			if(rooms[payload.id]) {
				payload.results.push(rooms[payload.id]);
			}
		}
		callback();
	},"storage");
	core.on("getUsers",function(payload, callback) {
		if(payload.id) {
			payload.results = [];
			if(users[payload.id]) {
				payload.results.push(users[payload.id]);
			}
		}
		callback();
	},"storage");
	core.on("room", function(data, callback) {
		rooms[data.id] = data;
		callback();
	},"storage");
	core.on("user", function(data, callback) {
		users[data.id] = data;
		callback();
	},"storage");
}