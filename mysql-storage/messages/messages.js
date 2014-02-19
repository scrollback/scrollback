"use strict";

var db = require("../../lib/mysql.js");
var log = require("../../lib/logger.js");

module.exports = function(core){
	core.on("messages", function(options, callback) {
		var startTime = new Date().getTime();
		var indexes = [];
		var dbName = "_messages";
		if(options.id) {
			return db.query("select * from text_messages where id = ?",[options.id], function(err, data) {
				if(err) return callback(err);
				data.forEach(function(element) {
					element.type = "text";
					fixOrigin(element);
					fixLabels(element);
				});
				callback(true, data);
			});
		}
		if (options.type) dbName = options.type + dbName;

		var query = "SELECT * FROM `" + dbName + "` ",
			where = [], params=[], desc=false, limit=256, until, since, originObject = {};

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
			where.push("`to` in (?)");
			indexes.push('totime');
			if(typeof options.to=="string")
				params.push([options.to]);
			else
				params.push(options.to);
		}

		if(options.from) {
			where.push("`from` in (?)");
			indexes.push('fromtime');
			if(typeof options.from=="string")
				params.push([options.from]);
			else
				params.push(options.from);
		}

		// When you add a query with label, ensure that 'to' is also specified
		// and add the index tolabeltime to the mix.

		if(until) {
			desc = true;
		}

		if(options.type == "text" && options.labels) {
			where.push("`label` in (?)");
			params.push(options.labels);
		}

		if (indexes.length) {
			query += " USE INDEX (`" + indexes.join("`,`") + "`)";
		}


		if(where.length) query += " WHERE " + where.join(" AND ");
		query += " ORDER BY `time` " + (desc? "DESC": "ASC");


		//this is a hacky fix... should be changed... this need to get all the messages in db for rooms.
		// limit: 0 will give all the messages. limit : something or limit undefined will give at max 256 msgs.
		if(typeof options.limit == "undefined")
			options.limit =255;
		if(options.limit && options.limit<=256){
			limit = options.limit;
		}

		if(limit) query += " LIMIT " + (limit + 1);

		if(desc) query = "SELECT * FROM (" + query + ") r ORDER BY `time` ASC";

		log(query, params);
		db.query(query, params, function(err, data) {
			var start, end, labelObj, i;
			if(err && callback) return callback(err);
			data.forEach(function(element){
				element.type = options.type;
				fixOrigin(element);
				fixLabels(element);
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

			log(data.length, "results in", new Date().getTime() - startTime, "ms");
			if(callback) callback(true, data);
		});
	}, "storage");
};

function fixOrigin(element) {
	var originObject;
	try{
		element.origin = JSON.parse(element.origin);
	}
	catch(Exception){
		originObject = {};
		originObject.gateway = element.origin.split(":")[0];
		if (originObject.gateway == "irc")
			originObject.channel = element.to;
		if (originObject.gateway == "web") {
			originObject.ip = element.origin.split("//")[1];
		}
		element.origin = originObject;
	}
	if (element.origin && element.origin.gateway == "web") {
		element.origin.ip && delete element.origin.ip;
		element.origin.location && delete element.origin.location;
	}
	return element;
}


function fixLabels(element) {
	var labelObj, i;
	if(!element.labels){
		element.labels = [];
		return;
	}
	try{
		labelObj = JSON.parse(element.labels);
		element.labels = [];
		for(i in labelObj){
			if(labelObj.hasOwnProperty(i) && labelObj[i]){
				element.labels.push(i);
			}
		}
	}catch(Exception){
		element.labels = [element.labels];
	}
}