var log = require("../../lib/logger.js");
var config = require('../../config.js');
var db = require('../../lib/mysql.js');
/**
Process join and part massages
*/
module.exports = function(core) {
	core.on('message', function(message, callback) {
		log("Heard \"message\ Event");
		if(message.type && (message.type==="join"||message.type=="part") && message.from.indexOf('guest-')!==0){
			var part = message.type==="join"?null: new Date().getTime();
			db.query("INSERT INTO scrollback.members(`user`, `room`, `joinedOn`, `partedOn`)" +
					" VALUES (?) ON DUPLICATE KEY UPDATE partedOn=values(`partedOn`)",
					[[message.from , message.to , new Date().getTime(), part]],function(v){
						log("---error--",v);
			});
		}
		callback();
	}, "watcher");

	core.on("members", function(query, callback) {
		var sql = "SELECT `room`, `user`, `joinedOn` FROM `members` WHERE ",
			where = [], params = [];
		log("Heard \"members\" Event");
		if (!callback) {
			return false;
		}

		if (!query.room && !query.user) {
			return callback(new Error("You must specify a room or a user."));
		}

		if (query.user) {
			where.push("`user` in (?)");
			if(typeof query.user=="string")
				params.push([query.user]);
			else
				params.push(query.user);
		}

		if (query.room) {
			where.push("`room` in (?)");
			if(typeof query.room=="string")
				params.push([query.room]);
			else
				params.push(query.room);
		}

		where.push("`partedOn` IS NULL");
		sql += where.join(" AND ");

		sql += " ORDER BY `joinedOn` DESC";
		db.query(sql, params, function(err, data) {
			if(!err) err=true;
			callback(err, data);
		}, "storage");
	});
};
