"use strict";
var core, occupantDB, config, get, changeUser;

function onGetUsers(query, callback) {
	if (query.memberOf || query.results) {
		return callback();
	}
	if (query.ref && query.ref === 'me') {
		return get("session", query.session, function(err, sess) {
			if (err) return callback(err);
			if (sess) {
				query.ref = sess.user;
				return callback();
			} else {
				return callback(new Error("SESSION:NOT_INITIALIZED"));
			}
		});
	} else if (query.occupantOf) {
		return occupantDB.smembers("room:{{" + query.occupantOf + "}}:hasOccupants", function(err, data) {
			if (err) return callback(err);
			if (!data || data.length === 0) {
				query.results = [];
				return callback();
			}
			query.ref = data;
			return callback();
		});
	} else {
		callback();
	}
}

function onGetRooms(query, callback) {
	if (query.hasOccupant) {
		return occupantDB.smembers("user:{{" + query.hasOccupant + "}}:occupantOf", function(err, data) {
			if (err) return callback(err);
			if (!data || !data.length) {
				query.results = [];
				return callback();
			}
			
			query.ref = data;
			callback();
		});
	} else {
		callback();
	}
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	occupantDB = require('redis').createClient();
	occupantDB.select(config.occupantsDB);
	get = require("./get.js")(config);
	changeUser = require("./change-user.js")(core, config);
	core.on("init", changeUser, "cache");
	core.on("user", changeUser, "cache");
	core.on("getUsers", onGetUsers, "cache");
	core.on("getRooms", onGetRooms, "cache");
};
