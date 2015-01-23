/* jshint mocha: true */
var config = require("../server-config-defaults.js");
var coreLevelDB = new (require('ebus'))();
var coreStorage = new (require('ebus'))();
var log = require('../lib/logger.js');
//var path = __dirname + "/" + "data-test";


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
	} else log("counter ", this.counter, this.count);
};
Counter.prototype.inc = function(i) {
	this.count += i;
	log.d("Count:",  this.count, i);
	//process.exit(0);
};
coreLevelDB.emit("getUsers", {identity: "mailto"}, function(err, reply) { 
	console.log(JSON.stringify(reply));
	var cc = new (Counter)(reply.results.length, afterSavingAllUsers);
	reply.results.forEach( function(user)  {
		users[user.id] = user;
		if (!user.createTime) user.createTime = 1;
		coreStorage.emit("user", {type: "user", user: user}, function() {
			console.log("saved user", arguments);
			cc.done();
		});
	});
});

function afterSavingAllUsers() {
	log.d("All users", users);
	var c = new (Counter)(0, function() {
		afterSavingAllRooms();
		log.d("Room saving complete");
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
		log.d("Join complete");
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
			}
		});
	}
	
	for (var roomid in rooms) {
		forEachRoom(roomid);
	}
}

function sendJoin(user, room, callback) {
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

