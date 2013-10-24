var config = require('../../config.js');
var redisProxy = require('../../core/redisProxy.js');


module.exports = function(core) {
	redisProxy.smembers("rooms", function(err, rooms) {
		rooms.forEach(function(room) {
			console.log("un caching "+room);
			redisProxy.del(room);	
		});
	});
	core.on('message', function(message, callback) {
		if(message.type === "back") {
			if(message.to) {
				redisProxy.sadd("rooms", message.to);
				redisProxy.sadd(message.to, message.from);
			}
		}
		if(message.type === "away"){
			if(message.to) redisProxy.srem(message.to,message.from);
		}
		callback();
	});
};

