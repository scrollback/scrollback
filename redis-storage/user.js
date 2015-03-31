var core, userDB, occupantDB, config, get, put,
	log = require("../lib/logger.js");
	
function getUserById(id, callback) {
	return get("user", id, function(err, data) {
		if (err || !data) return callback();
		return callback(null, data);
	});
}

function getUsersById(ids, callback) {
	var rids = [];
	rids = ids.map(function(id) {
		return "user:{{" + id + "}}";
	});
	return userDB.mget(rids, function(err, data) {
		var i, l;
		if (err || !data) return callback();
		for (i = 0, l = data.length; i < l; i++) {
			if (!data[i]) return callback();
		}
		i=0;
		data.forEach(function(item) {
			try {
				data[i] = JSON.parse(item);
			} catch (e) {
				data[i] = null;
			}
			i++;
		});
		callback(null, data);
	});
}

function onGetUsers(query, callback) {
	if (query.memberOf || query.results) {
		return callback();
	}
	if (query.ref) {
		if (query.ref == 'me') {
			get("session", query.session, function(err, sess) {
				if (sess) {
					get("user", sess.user, function(err, data) {
						if (err || !data) {
							return callback();
						}
						data.allowedDomains = sess.allowedDomains;
						data.restricted = sess.restricted;
						query.results = [data];
						callback();
					});
				} else {
					callback();
				}

			});
		} else {
			if (typeof query.ref == "string") {
				getUserById(query.ref, function(err, data) {
					if (err || !data) {
						return callback();
					}
					query.results = [data];
					callback();
				});
			} else {
				getUsersById(query.ref, function(err, data) {
					if (err || !data) {
						return callback();
					}
					query.results = data;
					callback();
				});
			}

		}
	} else if (query.occupantOf) {
		return occupantDB.smembers("room:{{" + query.occupantOf + "}}:hasOccupants", function(err, data) {
			var res = [];
			if (err) return callback(err);
			if (!data || data.length === 0) {
				query.results = [];
				return callback();
			}
			data = data.map(function(e) {
				return "user:{{" + e + "}}";
			});
			userDB.mget(data, function(err, data) {

				if (!data) {
					query.results = [];
					return callback();
				}
				data = data.map(function(e) {
					return JSON.parse(e);
				});
				data.forEach(function(e) {
					if (e && e.id) res.push(e);
				});
				query.results = res;
				return callback();
			});
		});
	} else {
		callback();
	}
}

function updateUser(action, callback) {
	put("user", action.user.id, action.user, function() {
		if (action.old && action.old.id !== action.user.id) {
			userDB.del("user:{{" + action.old.id + "}}", function(err) {
				if(err) {
					log.e("Old not present", JSON.stringify(action));
				}
			});
			occupantDB.smembers("user:{{" + action.old.id + "}}:occupantOf", function(err, data) {
				data.forEach(function(room) {
					occupantDB.srem("room:{{" + room + "}}:hasOccupants", action.old.id);
					occupantDB.sadd("room:{{" + room + "}}:hasOccupants", action.user.id, function(err, res) {
						if(err) log.d(err, res);
					});
				});
			});
			if(action.occupantOf && action.occupantOf.length) {
				occupantDB.rename("user:{{" + action.old.id + "}}:occupantOf", "user:{{" + action.user.id + "}}:occupantOf", function(err) {
					if(err) {
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
	
	core.on("user", function(action, callback) {
		userDB.set("user:{{" + action.user.id + "}}", JSON.stringify(action.user));
		callback();
	}, "storage");
	
	core.on("init", updateUser, "storage");
	core.on("getUsers", onGetUsers, "cache");
};
