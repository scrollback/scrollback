"use strict";

var pool = require("../data.js");
var log = require("../../lib/logger.js");

module.exports = function(options, callback) {
	pool.get(function(err, db) {
		var query = "SELECT * FROM `messages` ",
			where = [], params=[], desc=false, limit=256, until, since, originObject = {};
		
		if(err && callback) return callback(err);
		
		until=options.until;
		since=options.since;
		
		if (!until && !since) {
			until = new Date().getTime();
		}
		
		if(until) {
			where.push("`time` < ?");
			params.push(until);
		}
		
		if(since) {
			where.push("`time` > ?");
			params.push(since);
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
		
		if(until) {
			desc = true;
		}
		
		if(where.length) query += " WHERE " + where.join(" AND ");
		query += " ORDER BY `time` " + (desc? "DESC": "ASC");
		if(limit) query += " LIMIT " + (limit + 1);
		
		if(desc) query = "SELECT * FROM (" + query + ") r ORDER BY time ASC";
		
		log(query, params);
		db.query(query, params, function(err, data) {
			var start, end;
			db.end(); // I'm done with this db connection. This is important!

			if(err && callback) return callback(err);



			data.forEach(function(element){
				try{
					element.origin = JSON.parse(element.origin);	
				}
				catch(Exception){
					originObject = {};
					originObject.gateway = element.origin.split(":")[0];
					if (originObject.gateway == "irc")
						originObject.channel = element.to;
					if (originObject.gateway == "web")
						originObject.ip = element.origin.split("//")[1];
					element.origin = originObject;
				}	
			});
			
			start  = since || data.length && data[0].time || 0;
			end = until || data.length && data[data.length-1].time || 0;
	
			if (desc) {
				data.push({type: 'result-end', to: options.to, time: end });
			} else {
				data.unshift({type: 'result-start', to: options.to, time: start });
			}
			
			if (limit && data.length > limit) {
				if (desc) {
					data = data.slice(1);
					data.unshift({type: 'result-start', to: options.to, time: start });
				} else {
					data = data.slice(0,limit);
					data.push({type: 'result-end', to: options.to, time: end });
				}
			}
			
			log("Query results: " + data.length);
			if(callback) callback(null, data);
		});
	});
};

