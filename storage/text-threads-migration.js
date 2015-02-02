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
	}
};
Counter.prototype.inc = function(i) {
	this.count += i;
};
coreLevelDB.emit("getUsers", {identity: "mailto"}, function(err, reply) {
	console.log(JSON.stringify(reply));
	reply.results.forEach( function(user)  {
		users[user.id] = user;
	});
	afterSavingAllUsers();
});

function afterSavingAllUsers() {
	var c = new (Counter)(0, function() {
		afterSavingAllRooms();
		log.d("Room saving complete");
	});

	function processUser(userid) {
		coreLevelDB.emit("getRooms", {hasMember: userid, role: "owner"}, function(err, reply) {
			//log.d("reply:", arguments);
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
					process.exit(1);
				}
				done();
				callback();
			});
		});
	}
	var multi = redis.multi();
	multi.get("timestamp:" + room.id);
	multi.get("id:" + room.id);
	multi.exec(function(err, replies) {
		var timestamp = replies[0];
		var lastId = replies[1];
		if (!timestamp) timestamp = 1;
		else timestamp = parseInt(timestamp);
		coreLevelDB.emit("getTexts", {to: room.id, after: 256, time: timestamp}, function(err, reply) {
			log("Timestamp:", timestamp, timestamp !== 1, lastId);
			
			if (reply.results.length === 256) {	
				removeInitialPartOfResults(reply, timestamp, lastId, room);
				//log("Results:-", reply.results);
				saveNextSetOfMessages(reply.results,  function() {
					var multi = redis.multi();
					multi.set("id:" + room.id, reply.results[reply.results.length - 1].id);
					multi.set("timestamp:" + room.id, reply.results[reply.results.length - 1].time);
					multi.exec(function(err, replies) {
						if (err) {
							log.e("replies:", err, replies);
							process.exit(1);
						}
						saveTextAndThreadsForRoom(room);
					});
				});
			} else { // end of text messages
				removeInitialPartOfResults(reply, timestamp, lastId, room);
				if (reply.results && reply.results.length) {
					saveNextSetOfMessages(reply.results, function() {
						multi.set("id:" + room.id, reply.results[reply.results.length - 1].id);
						multi.set("timestamp:" + room.id, reply.results[reply.results.length - 1].time);
						multi.exec(function(err, replies) {
							if (err) {
								log.e("replies:", err, replies);
								process.exit(1);
							}
							log("Saving for room ", room.id, "complete");
						});
					});
				}
			}
		});
	});
}


function removeInitialPartOfResults(reply, timestamp, lastId, room) {
	if (timestamp !== 1) {
		var isMatched = false;
		for (var i = 0; i < reply.results.length; i++) {
			if (reply.results[i].id === lastId) {
				isMatched = true;
				break;	
			}
		}
		if (!isMatched && reply.results.length !== 0) {
			log.e("ID did not match any result", room.id);
			process.exit(1);
		}
		reply.results.splice(0, i + 1);
	}
}

function getQueriesForTextMessages(texts) {
	var r = [];
	texts.forEach(function(text) {
		fixCoreuptText(text);
		var transform = actionTr.text(text);
		var q = (postgres.transformsToQuery(transform));
		q.forEach(function(query) {
			r.push(query);
		});
		
	});
	return r;
}

function fixCoreuptText(text) {
	delete text.labels.normal;
	delete text.labels.nonsense;
	delete text.labels.spam;
}


