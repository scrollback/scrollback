"use strict";
var core, occupantDB, config, get,
	log = require("../lib/logger.js");

function onGetUsers(query, callback) {
	if (query.memberOf || query.results) {
		return callback();
	}
	if (query.ref && query.ref === 'me') {
		log.d("request for session:", query.session);
		return get("session", query.session, function(err, sess) {
			log.d("response for session:", err, sess);
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
	} else {
		callback();
	}
}

function updateUser(action, callback) {
	if (action.old && action.old.id !== action.user.id) {
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
