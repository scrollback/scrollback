"use strict";

var config = require('../../config.js');
var db = require("../data.js");
var log = require("../../lib/logger.js");

module.exports = function(options, callback) {
	var query = "SELECT * FROM `messages` ",
		where = [], params=[], desc=false, limit=256;
		
	if(options.until || !options.since) {
		where.push("`time` < ?");
		params.push(options.until || new Date().getTime());
	}
	
	if(options.since) {
		where.push("`time` > ?");
		params.push(options.since);
	}
	
	if(options.to) {
		where.push("`to` = ?");
		params.push(options.to);
	}
	
	if(options.from) {
		where.push("`from` = ?");
		params.push(options.to);
	}
	
	if(options.type) {
		where.push("`type` = ?");
		params.push(options.type);
	}
	
	if(options.until) {
		desc = true;
	}
	
	if(where.length) query += " WHERE " + where.join(" AND ");
	query += " ORDER BY `time` " + (desc? "DESC": "ASC");
	if(limit) query += " LIMIT " + (limit + 1);
	
	if(desc) query = "SELECT * FROM (" + query + ") r ORDER BY time ASC";
	
	//console.log(query, params);
	db.query(query, params, function(err, data) {
		var start, end;
		if (limit && data.length > limit) {
			if (desc) {
				data = data.slice(1);
				start = data[0].time;
				end = options.until || data[limit-1].time;
			} else {
				data = data.slice(0,limit);
				start = options.since || data[0].time;
				end = data[limit-1].time;
			}
		} else {
			start = options.since || data.length && data[0].time;
			end = options.until || data.length && data[data.length-1].time;
		}
		
		if(err) {
			console.log(err); return;
		}
		log("Query results: " + data.length);
		data.push({type: 'result-end', to: options.to, time: end });
		data.unshift({type: 'result-start', to: options.to, time: start });
		
		callback(data);
	});
}