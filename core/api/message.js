"use strict";

var config = require('../../config.js');
var pool = require('../data.js'),
	guid = require('../../lib/guid.js');
var log = require("../../lib/logger.js");
var gateways = require("../gateways.js");

module.exports = function(message, cb) {
	pool.get(function(err, db) {
		if (err) throw err;
		if (!message.id) message.id = guid();
		if (!message.time) message.time = new Date().getTime();
		
		if(typeof message.to === 'string') message.to = [message.to];
		
		message.to.forEach(function(to) {
			db.query("INSERT INTO `messages` SET `id`=?, `from`=?, `to`=?, `type`=?, `text`=?, "+
				"`origin`=?, `time`=?, `ref`=?", [message.id, message.from, message.to, message.type, 
				message.text, message.origin, message.time, message.ref]);
		});
		db.query("SELECT * FROM `accounts` WHERE `room` IN ?", [message.to], function(err, data) {
			var i, l, name, list = {};
			if(err) { console.log("Can't get list of accounts", err); return; }
			for(i=0, l=data.length; i<l; i+=1) {
				name = data[i].id.split(':')[0];
				if(!list[name]) list[name] = [];
				list[name].push(data[i].id);
			}
			for(name in list) {
				if(gateways[name] && gateways[name].send)
					gateways[name].send(message, list[name]);
			}
			db.end();
		});
		console.log(message);
		gateways.http.send(message, [message.to]);
	});
};
