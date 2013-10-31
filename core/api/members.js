"use strict";
var log = require("../../lib/logger.js"),
	db = require('../data.js');

module.exports = function(query, callback) {
	var sql = "SELECT `room`, `user`, `joinedOn` FROM `members` WHERE ",
		where = [], params = [];
	
	if (!callback) {
		return false;
	}
	
	if (query.user) {
		where.push("`user`=?");
		params.push(query.user);
	}
	
	if (query.room) {
		where.push("`room`=?");
		params.push(query.room);
	}
	
	if (!query.room && !query.user) {
		return callback(new Error("You must specify a room or a user."));
	}
	where.push("`partedOn` IS NULL");
	sql += where.join(" AND ");
	
	sql += " ORDER BY `joinedOn` DESC";
	db.query(sql, params, callback);
}
