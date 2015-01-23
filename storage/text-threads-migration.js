/* jshint mocha: true */
var config = require("./../server-config-defaults.js");
var coreLevelDB = new (require('ebus'))();
var coreStorage = new (require('ebus'))();
var log = require('../lib/logger.js');
var redis = require('redis').createClient();
var postgres = require('./postgres.js');
var actionTr = require('./action-transform.js');
var pg = require('pg');
process.env.NODE_ENV = config.env;
var conString = "pg://" + config.storage.pg.username + ":" +
	config.storage.pg.password + "@" + config.storage.pg.server + "/" + config.storage.pg.db;
redis.select(15);

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
	reply.results.forEach( function(user)  {
		users[user.id] = user;
	});
	afterSavingAllUsers();
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
					rooms[room.id] = room;
					c.done();
				});
			} else c.done();
		});	
	}
	
	for (var userid in users) {
		c.inc(1);
		processUser(userid);
	}
}

function afterSavingAllRooms() {
	log.d("all rooms saved", rooms.scrollback);
	/*log.d("Rooms:", rooms);
	log.d("Users:", users);*/
	for (var roomid in rooms) {
		saveTextAndThreadsForRoom(rooms[roomid]);
	}
	
}


// TODO 1. Too many files open problem. 
function saveTextAndThreadsForRoom(room) {
	function saveNextSetOfMessages(messages, callback) {
		var queries = getQueriesForTextMessages(messages);
		log.d(queries);
		pg.connect(conString, function(error, client, done) {
			if (error) {
				log("Unable to get Pool Connection Object: ", error);
				return callback(error);
			}
			postgres.runQueries(client, queries, function(err, replies) {
				if (err){
					log.e("replies:", err, replies);
					process.exit();
				}
				done();
				callback();
			});
		});
	}
	
	redis.get("timestamp:" + room.id, function(err, timestamp) {
		if (!timestamp) timestamp = 1;
		else timestamp = parseInt(timestamp);
		coreLevelDB.emit("getTexts", {to: room.id, after: 256, time: timestamp}, function(err, reply) {
			log("Timestamp:", timestamp, timestamp !== 1);
			
			//log("Results:-", reply.results);
			//process.exit(1);
			if (reply.results.length === 256) {	
				if (timestamp !== 1) { 
					reply.results.splice(0, 1);
				}
				log("Results:-", reply.results);
				saveNextSetOfMessages(reply.results,  function() {
					log("Timestamp", reply.results[reply.results.length - 1].time);
					redis.set("timestamp:" + room.id, reply.results[reply.results.length - 1].time, function() {
						saveTextAndThreadsForRoom(room);
					});
				});
			} else { // end of text messages
				if (timestamp !== 1) { 
					reply.results.splice(0, 1);
				}
				if (reply.results && reply.results.length) {
					saveNextSetOfMessages(reply.results, function() {
						redis.set("timestamp:" + room.id, reply.results[reply.results.length - 1].time, function() {
							log("Saving for room ", room.id, "complete");
						});
					});
				}
			}
		});
	});
}


function getQueriesForTextMessages(texts) {
	var r = [];
	texts.forEach(function(text) {
		var transform = actionTr.text(text);
		var q = (postgres.transformsToQuery(transform));
		q.forEach(function(query) {
			r.push(query);
		});
		
	});
	return r;
}


