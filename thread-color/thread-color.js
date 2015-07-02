"use strict";
var log = require("../lib/logger.js"),
	redis = require('redis');

module.exports = function (core, config) {
	var db = redis.createClient();
	db.select(config.redisDB);
	
	core.on('text', function (text, next) {
		var key = 'threader:' + text.to + ':color';
		if(text.thread !== text.id || typeof text.color !== 'undefined') return next();
		db.incr(key, function(err, num) {
			num = parseInt(num);
			text.color = num % config.numColors;
			log('gave color ' + text.color);
			if(num >= 10000*config.numColors && num % config.numColors === 0) {
				log.i("Thread color cycling wrapped around for " + text.to);
				db.decrby(key, num);
			}
			next();
		});
	}, 499);
};

