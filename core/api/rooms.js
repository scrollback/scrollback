var pool = require("../data.js");
var log = require("../../lib/logger.js");

module.exports = function(options, callback) {
	pool.get(function(err, db) {
		var query = "SELECT * FROM `rooms` ",
			where = [], params=[], desc=false, limit=256;
		
		if(err && callback) return callback(err);
		
		if(options.type) {
			where.push("`type` = ?");
			params.push(options.type);
		}
		
		if(options.query) {
			where.push("(`name` LIKE ? OR `description` LIKE ?)");
			options.push("%"+query+"%");
			options.push("%"+query+"%");
		}
		
		if(options.accounts) {
			where.push("`id` IN (SELECT `room` FROM `accounts` WHERE `id` IN (?))");
			params.push(options.accounts);
		}
		
		if(where.length) query += " WHERE " + where.join(" AND ");
		query += " LIMIT 64";
		
		log(query, params);
		db.query(query, params, function(err, data) {
			db.end();
			if(callback) callback(err, data);
		});
	});
};