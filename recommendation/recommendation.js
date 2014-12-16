var log = require("../lib/logger.js"), redis, core;

module.exports = function(coreObject, config) {
	redis = require('redis').createClient();
	redis.select(config.redisDB);
	core = coreObject;
	
	core.on("getRooms", function(q, callback) {
		if (q.featured) {
			log.i("Query for featured room");
			log.d("Query:", q);
			redis.smembers("featured:room", function(err, roomids) {
				log.d("Rooms retured from redis: ", roomids);
				q.ref = roomids;
				callback();
			});
		} else callback();
	}, "gateway");
};
