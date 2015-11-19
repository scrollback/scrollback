"use strict";
var config, occupantDB, core;
var log = require("../lib/logger.js"),
	userOps = require("../lib/user-utils.js");

function onBack(data, cb) {
	occupantDB.sadd("room:{{" + data.to + "}}:hasOccupants", data.from, function(err, res) {
		if (err) log.d(err, res);
	});
	occupantDB.sadd("user:{{" + data.from + "}}:occupantOf", data.to, function(err, res) {
		if (err) log.d(err, res);
	});
	
	data.user.status = "online";
	cb();
}

function onAway(action, callback) {
	occupantDB.srem("room:{{" + action.to + "}}:hasOccupants", action.from, function(err) {
		if(err) log.e(err);
		occupantDB.scard("room:{{" + action.to + "}}:hasOccupants", function(error, data) {
			log.d(error);
			if (!data) occupantDB.del("user:{{" + action.from + "}}:occupantOf");
		});
	});

	occupantDB.srem("user:{{" + action.from + "}}:occupantOf", action.to, function(err) {
		if(err) log.e(err);
		occupantDB.scard("user:{{" + action.from + "}}:occupantOf", function(error, data) {
			if (!data) {
				occupantDB.del("user:{{" + action.from + "}}:occupantOf");
				if (userOps.isGuest(action.user.id)) action.deleteGuestNow = true;
				else action.leftLastRoom = false;
			}
			callback();
		});
	});
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	occupantDB = require('redis').createClient();
	occupantDB.select(config.occupantsDB);	
	occupantDB.flushdb();
	require("./entity.js")(core, config);
	require("./session.js")(core, config);
	core.on("back", onBack, "cache");
	core.on("away", onAway, "cache");
};
