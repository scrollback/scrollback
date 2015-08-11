"use strict";
var config, occupantDB, userDB, roomDB, core;
var log = require("../lib/logger.js");

function onBack(data, cb) {
	occupantDB.sadd("room:{{" + data.to + "}}:hasOccupants", data.from, function(err, res) {
		if(err) log.d(err, res);
	});
	occupantDB.sadd("user:{{" + data.from + "}}:occupantOf", data.to, function(err, res) {
		if(err) log.d(err, res);
	});
	cb();
}

function onAway(action, callback) {
	occupantDB.srem("room:{{" + action.to + "}}:hasOccupants", action.from, function() {
		if (!/^guest-/.test(action.from)) return;
		occupantDB.scard("room:{{" + action.to + "}}:hasOccupants", function(err, data) {
			if (!data) userDB.del("room:{{" + action.to + "}}");
		});
	});
	occupantDB.srem("user:{{" + action.from + "}}:occupantOf", action.to, function() {
		if (!/^guest-/.test(action.from)) return;
		occupantDB.scard("user:{{" + action.from + "}}:occupantOf", function(err, data) {
			if (!data) userDB.del("user:{{" + action.from + "}}");
		});
	});
	callback();
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	occupantDB = require('redis').createClient();
	occupantDB.select(config.occupantsDB);
	userDB = require('redis').createClient();
	userDB.select(config.userDB);
	roomDB = require('redis').createClient();
	roomDB.select(config.roomDB);
	require("./session.js")(core, config);
	occupantDB.flushdb();
	core.on("back", onBack, "storage");
	core.on("away", onAway, "storage");
};
