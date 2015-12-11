/* eslint-env mocha */
var config = require("../server-config-defaults.js");
var coreLevelDB = new (require('ebus'))();
var coreStorage = new (require('ebus'))();
var log = require('../lib/logger.js');
//var path = __dirname + "/" + "data-test";
process.env.NODE_ENV = config.env;
log.setEmailConfig(config.email);
config['leveldb-storage'].disableQueries = false;
config["leveldb-storage"].global = config.global;
require('./storage.js')(coreStorage, config.storage);
require("./../leveldb-storage/leveldb-storage.js")(coreLevelDB, config["leveldb-storage"]);
var rooms = {};
var users = {};
function Counter(c, cb) {
	this.counter = 0;
	this.count = c;
	this.callback = cb;
	
}
Counter.prototype.done = function() {
	this.counter += 1;
	if (this.counter === this.count) {
		return this.callback();
	}
};
Counter.prototype.inc = function(i) {
	this.count += i;
};
coreLevelDB.emit("getUsers", {identity: "mailto"}, function(err, reply) { 
	var cc = new (Counter)(reply.results.length, afterSavingAllUsers);
	reply.results.forEach( function(user)  {
		fixCoreuptUser(user);
		users[user.id] = user;
		if (!user.createTime) user.createTime = 1;
		coreStorage.emit("user", {type: "user", user: user}, function(err) {
			if (err) {
				log.e("user event failed:", err);
				process.exit(1);
			}
			cc.done();
		});
	});
});


function fixCoreuptUser(user) {
	if (!user.params) user.params = {};
	if (!user.guides) user.guides = {};
	user.identities = makeSet(user.identities);
	
}

function fixCoreuptRoom(room) {
	if (!room.params) room.params = {};
	if (!room.guides) room.guides = {};
	room.identities = makeSet(room.identities);
}

function makeSet(arr) {
	var map = {};
	arr.forEach(function(a) {
		map[a] = true;
	});
	var r = [];
	for (var key in map) {
		r.push(key);
	}
	return r;
}

function afterSavingAllUsers() {
	//log.d("All users", users);
	var c = new (Counter)(0, function() {
		afterSavingAllRooms();
		log("Room saving complete");
	});
	
	function processUser(userid) {
		coreLevelDB.emit("getRooms", {hasMember: userid, role: "owner"}, function(err, reply) {
			log.d("reply:", arguments);
			if (!err && reply.results && reply.results.length) {
				c.inc(reply.results.length);
				c.done();
				reply.results.forEach(function(room) {
					saveRoom(room, users[userid], function() {
						c.done();
					});
				});
			} else c.done();
		});	
	}
	for (var userid in users) {
		c.inc(1);
		processUser(userid);
	}
	
}

function saveRoom(room, owner, callback) {
	fixCoreuptRoom(room);
	function save(ra) {
		if (!room.roleSince) {
			ra.time = Math.max(owner.createTime, room.createTime); 
		}
		coreStorage.emit("room", ra, function(err /*reply*/) {
			if (!err) callback();
			else {
				log.e("Error while saving room.", room);
				process.exit(1);
			}
		});
	}
	if (!rooms[room.id]) {
		rooms[room.id] = room;
		var roomAction = {
			user: owner,
			room: room,
			type: "room",
			old: {},
			time: room.roleSince
		};
		
		if (!room.createTime) {
			coreLevelDB.emit("getTexts", {to: room.id, after: 2, time: 1}, function(err, reply) {
				if (err) {
					log.e("getTexts failed:", err);
					process.exit(1);
				}
				if (reply.results && reply.results.length) {
					room.createTime = reply.results[0].time - 1;
				} else room.createTime = new Date().getTime();
				save(roomAction);
			}); 
		} else {
			save(roomAction);
		}
	} else callback();
}


function afterSavingAllRooms() {
	var joinCounter = new Counter(0, function() {
		log("Join complete");
	});
	function forEachRoom(roomid) {
		
		coreLevelDB.emit("getUsers", {type: "getUsers", memberOf: roomid}, function(err, reply) {
			if (!err && reply.results && reply.results.length) {
				joinCounter.inc(reply.results.length);
				reply.results.forEach(function(user) {
					sendJoin(user, rooms[roomid], function() {
						joinCounter.done();
					});
				}); 
			} else if (err) {
				log.e("getUsers failed:", err);
				process.exit(1);
			}
		});
	}
	
	for (var roomid in rooms) {
		forEachRoom(roomid);
	}
}

function sendJoin(user, room, callback) {
	if (!users[user.id]) {
		log("Invalid User:", user);
		return;
	}
	if (!user.createTime) user.createTime = 1;
	var joinAction = {
		to: room.id,
		from: user.id,
		user: user,
		room: room,
		type: "join",
		role: user.role,
		time: user.roleSince
	};
	if (!user.roleSince) {
		joinAction.time = Math.max(user.createTime, room.createTime) + 10000;
		
	}
	delete user.role;
	delete user.roleSince;
	coreStorage.emit("join", joinAction, function(err) {
		if (!err) callback();
		else {
			log.e("Join failed: ", err);
			log.e("Join action:", joinAction);
			process.exit(1);
		}
	});
}

