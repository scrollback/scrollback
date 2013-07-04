//exports.room = require("./room/room.js");
//exports.user = require("./user/user.js");
//exports.post = require("./post/post.js");
"use strict";

var config = require('../config.js');
var db = require('mysql').createConnection(config.mysql);
var rooms = {}, gateways;
var log = require("../lib/logger.js");

function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    connection = require("mysql").createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}

handleDisconnect(db);


exports.init = function (gw){
	gateways = gw;
};

exports.send = function(message) {
	db.query("INSERT INTO `messages` SET `from`=?, `to`=?, `type`=?, `text`=?, "+
		"`time`=?", [message.from, message.to, message.type,
		message.text, message.time]);
	
	gateways['http'].send(message, [message.to]);
	
	db.query("SELECT * FROM `accounts` WHERE `room`=?", [message.to],
		function(err, data) {
			var i, l, name, list = {};
			if(err) console.log("Can't get list of rooms");
			for(i=0, l=data.length; i<l; i+=1) {
				name = data[i].id.split(':')[0];
				if(!list[name]) list[name] = [];
				list[name].push(data[i].id);
			}
			for(name in list) {
				if(gateways[name] && gateways[name].send)
					gateways[name].send(message, list[name]);
			}
		});
};

exports.messages = function(options, callback) {
	var query = "SELECT `from`, `to`, `type`, `text`, `time` "+
		"FROM `messages` ", where = [], params=[], desc=false,
		limit=256;
	
	if (!options.until && !options.since) {
		options.until = new Date().getTime();
	}
	
	if(options.until) {
		where.push("`time` < ?");
		params.push(options.until);
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
			start = options.since || data[0].time;
			end = options.until || data[limit-1].time;
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
