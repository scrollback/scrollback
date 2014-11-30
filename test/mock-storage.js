var core = new(require("../lib/emitter.js"))();
var rooms = {
	"scrollback": {
		id: "scrollback",
		description: "this is room",
		type: "room",
		identities: ["irc://harry.scrollback.io/#scrollback"],
		timezone: 300,
		params: {},
		guides: {}
	},
	"scrollbackteam": {
		id: "scrollbackteam",
		description: "this is team room",
		type: "room",
		identities: ["irc://harry.scrollback.io/#scrollbackteam"],
		timezone: 300,
		params: {},
		guides: {}
	},
	"nlptest": {
		id: "nlptest",
		description: "this is test room",
		type: "room",
		identities: ["irc://harry.scrollback.io/#nlptest"],
		timezone: 300,
		params: {},
		guides: {}
	}
};

var users = {
	"harish": {
		id: "harish",
		description: "this is harish",
		type: "user",
		identities: ["mailto:harish@scrollback.io"],
		timezone: 330,
		params: {},
		guides: {}
	},
	"kamal": {
		id: "kamal",
		description: "this is kamal",
		type: "user",
		identities: ["mailto:kamal@scrollback.io"],
		timezone: 630,
		params: {},
		guides: {}
	},
	"amal": {
		id: "amal",
		description: "this is amal",
		type: "user",
		identities: ["mailto:amal@scrollback.io"],
		timezone: 630,
		params: {},
		guides: {}
	},
	"satya": {
		id: "satya",
		description: "this is satya",
		type: "user",
		identities: ["mailto:satya@scrollback.io"],
		timezone: 630,
		params: {},
		guides: {}
	},
};

var sessions = {
	"web:session1": "harish",
	"web:session2": "kamal",
	"web:session3": "amal",
	"web:session4": "satya"
};


var membership = {
	scrollback: {
		"harish": {
			role: "owner",
		},
		"kamal": {
			role: "follower",
		},
		"satya": {
			role: "follower",
		}
	},
	scrollbackteam: {
		"amal": {
			role: "owner",
		},
		"harish": {
			role: "follower",
		}
	},
	nlptest: {
		"kamal": {
			role: "owner",
		},
		"satya": {
			role: "follower",
		}
	}
};

/*var occupantList = {
	scrollback: ["harish", "kamal"],
	nlptest: ["kamal", "satya"],
	scrollbackteam: ["amal", "harish"]
};*/
module.exports = function(c) {
	core = c;

	core.on("getRooms", function(payload, callback) {
		var result = [],
			obj, user, rs;
		if (payload.hasMember) {
			if (payload.hasMember == "me") user = sessions[payload.session];
			else user = payload.hasMember;

			if (payload.ref) {
				if (membership[payload.ref] && membership[payload.ref][user]) {
					obj = clone(rooms[payload.ref], {});
					obj.role = membership[payload.ref][user].role;
					result.push(obj);
				}
			} else {
				rs = Object.keys(membership);
				rs.forEach(function(room) {
					if (membership[room][user]) {
						obj = clone(rooms[room], {});
						obj.role = membership[room][user].role;
						result.push(obj);
					}
				});
			}
		} else if (payload.ref) {
			if (rooms[payload.ref]) {
				result.push(rooms[payload.ref]);
			}
		}
		payload.results = result;
		callback();
	}, "storage");

	core.on("getUsers", function(payload, callback) {
		var result = [],
			names, obj, user;
		if (payload.memberOf) {
			if (payload.ref) {
				if (payload.ref == "me") user = sessions[payload.session];
				else user = payload.ref;
				if (membership[payload.memberOf][user]) {
					obj = clone(users[user], {});
					obj.role = membership[payload.memberOf][user].role;
					result.push(obj);
				}
			} else {
				names = Object.keys(membership[payload.memberOf]);
				names.forEach(function(name) {
					obj = clone(users[name], {});
					obj.role = membership[payload.memberOf][name].role;
					result.push(obj);
				});

			}
		} else if (payload.ref) {
			if (users[payload.ref]) {
				result.push(users[payload.ref]);
			}
		}
		payload.results = result;
		callback();
	}, "storage");

	core.on("room", function(data, callback) {
		rooms[data.to] = data.room;
		callback();
	}, "storage");

	core.on("user", function(data, callback) {
		users[data.to] = data.to;
		callback();
	}, "storage");
};

function clone(obj1, obj2) {
	if (!obj2) obj2 = {};
	var keys = Object.keys(obj1);
	keys.forEach(function(key) {
		if (obj1[key] && obj1[key] instanceof Array) {
			obj2[key] = obj1[key].slice(0);
		} else if (obj1[key] && typeof obj1[key] == "object") {
			obj2[key] = clone(obj1[key], {});
		} else {
			obj2[key] = obj1[key];
		}
	});

	return obj2;
}