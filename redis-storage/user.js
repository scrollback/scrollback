"use strict";
var core, userDB, occupantDB, config, get, put,
	log = require("../lib/logger.js");

function onGetUsers(query, callback) {
	if (query.memberOf || query.results) {
		return callback();
	}
	if (query.ref && query.ref === 'me') {
		return get("session", query.session, function(err, sess) {
			if (err) return callback(err);
			if (sess) query.ref = sess.user;
			return callback();
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
	}
	callback();
}

function updateUser(action, callback) {
	put("user", action.user.id, action.user, function() {
		if (action.old && action.old.id !== action.user.id) {
			userDB.del("user:{{" + action.old.id + "}}", function(err) {
				if (err) {
					log.e("Old not present", JSON.stringify(action));
				}
			});
			occupantDB.smembers("user:{{" + action.old.id + "}}:occupantOf", function(error, data) {
				data.forEach(function(room) {
					occupantDB.srem("room:{{" + room + "}}:hasOccupants", action.old.id);
					occupantDB.sadd("room:{{" + room + "}}:hasOccupants", action.user.id, function(err, res) {
						if (err) log.d(err, res);
					});
				});
			});
			if (action.occupantOf && action.occupantOf.length) {
				occupantDB.rename("user:{{" + action.old.id + "}}:occupantOf", "user:{{" + action.user.id + "}}:occupantOf", function(err) {
					if (err) {
						log.e("Old not present", JSON.stringify(action));
					}
				});
			}

		}
		callback();
	});
}

module.exports = function(c, conf) {
	core = c;
	config = conf;
	userDB = require('redis').createClient();
	userDB.select(config.userDB);
	occupantDB = require('redis').createClient();
	occupantDB.select(config.occupantsDB);
	get = require("./get.js")(config);
	put = require("./put.js")(config);

	core.on("init", updateUser, "storage");
	core.on("getUsers", onGetUsers, "cache");
};
