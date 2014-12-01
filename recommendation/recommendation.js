var config = require('../server-config-defaults.js');
var log = require("../lib/logger.js");
var redis = require('../lib/redisProxy.js').select(config.redisDB.recommendation);
var core;
module.exports = function(coreObject) {
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
