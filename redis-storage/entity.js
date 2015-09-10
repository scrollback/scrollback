"use strict";
var core, occupantDB, config, get,
	log = require("../lib/logger.js");

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

function updateUser(action, callback) {
	if (action.old && action.old.id !== action.user.id) {
		occupantDB.smembers("user:{{" + action.old.id + "}}:occupantOf", function(error, data) {
			if(!error && data) {
				data.forEach(function(room) {
					occupantDB.srem("room:{{" + room + "}}:hasOccupants", action.old.id);
				});
			}
		});

		if (action.occupantOf && action.occupantOf.length) {
			occupantDB.del("user:{{" + action.old.id + "}}:occupantOf", "user:{{" + action.user.id + "}}:occupantOf", function(err) {
				if (err && err.message !== "ERR no such key") {
					log.e("Redis error:", err, JSON.stringify(action));
				}
			});
		}
	}
	callback();
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

	core.on("init", updateUser, "storage");
	core.on("getUsers", onGetUsers, "cache");
	core.on("getRooms", onGetRooms, "cache");
};
