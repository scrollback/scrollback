var log = require("../lib/logger.js");
var config = require('../config.js');
var redisProxy = require('../lib/redisProxy.js');

module.exports = function(core) {
	redisProxy.smembers("rooms", function(err, rooms) {
		rooms.forEach(function(room) {
			console.log("un caching "+room);
			redisProxy.del(room);	
		});
	});

	core.on('message', function(message, callback) {
		log("Heard a \"message\" event");
		if(message.type === "back") {
			if(message.to) {
				redisProxy.sadd("rooms", message.to);
				redisProxy.sadd("room:"+"occupants:"+message.to, message.from);
			}
		}
		if(message.type === "away"){
			if(message.to) redisProxy.srem("room:"+"occupants:"+message.to,message.from);
		}
		if(message.type === "nick"){
			if(message.to) {
				redisProxy.srem("room:"+"occupants:"+message.to,message.from);
				redisProxy.sadd("room:"+"occupants:"+message.to, message.ref);
			}
		}
		callback();
	}, "watcher");

	//right now only gives ids of the occupants. Note will also have guest users.
	core.on("occupant", function(query, callback) {
		redisProxy.smembers("room:"+"occupants:"+query.id, function(err, occupants) {
			callback(true, occupants);
		})
	},"storage");
};

