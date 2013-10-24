"use strict";
var log = require("../../lib/logger.js"),
	db = require('../data.js');
/**
 *callback(err,data) with all users joined 
 */
exports.getUsers = function (room,callback){
	db.query("SELECT user from members where room = ? ",[room],function(err,data){
		if (callback) {
			callback(err,data);
		}
	});
}
/**
 *callback(err,data) with active users(partedOn is null)
 **/
exports.getActiveUsers = function (room,callback){
	db.query("SELECT * from members where room = ? AND partedOn is null",[room],function(err,data){
		if (callback) {
			callback(err,data);
		}
	});
}
