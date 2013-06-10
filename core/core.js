//exports.room = require("./room/room.js");
//exports.user = require("./user/user.js");
//exports.post = require("./post/post.js");

var config = require('../config.js');
var db = require('mysql').createConnection(config.mysql);
var rooms = {}, gateways;

db.on('close', function(err) {
	if(err) {
		db.on('error', function() {}); // Don't crash.
		console.log("DB Connection Error:", err);
	}
	db = require('mysql').createConnection(config.mysql);
});

exports.init = function (gw){
	gateways = gw;
}

exports.send = function(message) {
	db.query("INSERT INTO `messages` SET `from`=?, `to`=?, `type`=?, `text`=?, "+
		"`time`=FROM_UNIXTIME(?)", [message.from, message.to, message.type,
		message.text, message.time/1000]);
	
	gateways['http'].send(message, [message.to]);
	
	db.query("SELECT * FROM `accounts` WHERE `room`=?", [message.to],
		function(err, data) {
			var i, l, name, list = {};
			if(err) console.log("Can't get list of rooms");
			for(i=0, l=data.length; i<l; i++) {
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

exports.read = function(options, callback) {
	var query = "SELECT `from`, `to`, `type`, `text`, "+
		"(UNIX_TIMESTAMP(`time`)*1000 + MICROSECOND(`time`)/1000) as `time` "+
		"FROM `messages` ", where = [], params=[], desc=false, limit=256;
	
	if(options.until) {
		where.push("`time` < FROM_UNIXTIME(?)");
		params.push(options.until/1000);
	}
	
	if(options.since) {
		where.push("`time` > FROM_UNIXTIME(?)");
		params.push(options.since/1000);
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
	
	if(options.until && options.since) {
		limit = null;
	} else if(options.until) {
		desc = true;
	}
	
	if(where.length) query += " WHERE " + where.join(" AND ");
	query += " ORDER BY `time` " + (desc? "DESC": "ASC");
	if(limit) query += " LIMIT " + limit;
	
	if(desc) query = "SELECT * FROM (" + query + ") r ORDER BY time ASC";
	
	//console.log(query, params);
	db.query(query, params, function(err, data) {
		if(err) {
			console.log(err); return;
		}
		//console.log("RESULTS:", data.length);
		if(limit && data.length < limit) {
			(desc? data.unshift: data.push)({
				type: "notice", from: '', to: options.to || '',
				text: 'There are no more messages', time: 0
			});
		}
		callback(data);
	});
}
