"use strict";
var log = require("../../lib/logger.js"),
	db = require('../data.js');

module.exports = function(query, callback) {
	var sql = "SELECT `room`, `user`, `joinedOn` FROM `members` WHERE ",
		where = [], params = [];
	
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
	db.query(sql, params, callback);
}
