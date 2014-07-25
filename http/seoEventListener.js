var log = require('../lib/logger.js');
var config = require('../config.js');
var internalSession = Object.keys(config.whitelists)[0];
var redis = require('../lib/redisProxy.js').select(config.redisDB.seo);
module.exports = function(core) {
	core.on("room", function(room, callback) {
		callback();
		redis.get("seo:" + room.id + ":isComplete", function(err, isComplete) {
			if(!isComplete) {
				startCounting(room.id);
			}
		});
	});

	function startCounting(roomId) {
		redis.get("seo:" + roomId + ":lastPageTime", function(err, time) {
			if(!err && time) {


			}
		});
	}


};
