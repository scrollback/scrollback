var config, occupantDB, userDB, roomDB, core;
var log = require("../lib/logger.js");

module.exports = function(c, conf) {
	core = c;
	config = conf;
	occupantDB = require('redis').createClient();
	occupantDB.select(config.occupantsDB);
	userDB = require('redis').createClient();
	userDB.select(config.userDB);
	roomDB = require('redis').createClient();
	roomDB.select(config.roomDB);
	require("./user.js")(core, config);
	require("./session.js")(core, config);
	occupantDB.flushdb();
	core.on("back", onBack, "storage");
	core.on("away", onAway, "storage");
	core.on("room", onRoom, "storage");
	core.on("getRooms", onGetRooms, "cache");
};

function getRoomsById(ids, callback) {
	var rids = [];
	rids = ids.map(function(id) {
		return "room:{{" + id + "}}";
	});
	return roomDB.mget(rids, function(err, data) {
		var i, l;
		if (err || !data) return callback();
		for (i = 0, l = data.length; i < l; i++) {
			if (!data[i]) return callback();
			try {
				data[i] = JSON.parse(data[i]);
			} catch (e) {
				return callback();
			}
		}
		callback(null, data);
	});
}

function onBack(data, cb) {
	roomDB.set("room:{{" + data.room.id + "}}", JSON.stringify(data.room));
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

function onRoom(action, callback) {
	roomDB.set("room:{{" + action.room.id + "}}", JSON.stringify(action.room));
	callback();
}

function onGetRooms(query, callback) {
	if (query.ref && !query.hasMember) {
		if (typeof query.ref === "string") {
			return roomDB.get("room:{{" + query.ref + "}}", function(err, data) {
				var res;
				if (err || !data) return callback();
				if (data) {
					try {
						res = JSON.parse(data);
						query.results = [res];
					} catch (e) {}
				}
				callback();
			});
		} else {
			getRoomsById(query.ref, function(err, data) {
				if (err || !data) {
					return callback();
				}
                
                query.source = "redis";
				query.results = data;
				callback();
			});
		}
	} else if (query.hasOccupant) {
		return occupantDB.smembers("user:{{" + query.hasOccupant + "}}:occupantOf", function(err, data) {
			if (err) return callback(err);
			if (!data || !data.length) {
				query.results = [];
				return callback();
			}
			data = data.map(function(e) {
				return "room:{{" + e + "}}";
			});

			roomDB.mget(data, function(err, data) {
				if (data) {
					data = data.map(function(e) {
						return JSON.parse(e);
					});
					query.results = data;
				} else {
					query.results = [];
				}

				return callback(err, data);
			});
		});
	} else {
		callback();
	}
}
