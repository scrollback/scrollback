var log = require("../../lib/logger.js");
var config = require('../../config.js');
var redisProxy = require('../../lib/redisProxy.js');

module.exports = function(core) {
	redisProxy.smembers("rooms", function(err, rooms) {
		rooms.forEach(function(room) {
			redisProxy.del(room);
		});
	});

	core.on('message', function(message, callback) {
		log("Heard a \"message\" event");
		var to=message.to;
		if(typeof message.to =="undefined") to=[];
		else if(typeof message.to =="string") to=[message.to];
		else to = message.to;

		if(message.type === "back") {
			to.forEach(function(element) {
				redisProxy.sadd("rooms", element);
				redisProxy.sadd("room:"+"occupants:"+element, message.from);
			});
		}
		if(message.type === "away"){
			to.forEach(function(element) {
				redisProxy.srem("room:"+"occupants:"+element, message.from);
			});
		}
		if(message.type === "nick"){
			to.forEach(function(element) {
				redisProxy.srem("room:"+"occupants:"+element,message.from);
				redisProxy.sadd("room:"+"occupants:"+element, message.ref);
			});
		}
		callback();
	}, "watcher");

	//right now only gives ids of the occupants. Note will also have guest users.
	core.on("occupant", function(query, callback) {
		redisProxy.smembers("room:"+"occupants:"+query.id, function(err, occupants) {
			callback(true, occupants);
		});
	},"storage");
};

