"use strict";

var config = require('../../config.js');
var data = require('../data.js'),
	guid = require('../../lib/guid.js');
var log = require("../../lib/logger.js");
var gateways = require("../gateways.js");

module.exports = function(message, cb) {
	data.get(function(err, db) {
		if (err) throw err;
		if (!message.id) message.id = guid();
		if (!message.time) message.time = new Date().getTime();
		db.query("INSERT INTO `messages` SET `id`=?, `from`=?, `to`=?, `type`=?, `text`=?, "+
			"`origin`=?, `time`=?, `ref`=?", [message.id, message.from, message.to, message.type, 
			message.text, message.origin, message.time, message.ref]);
	
		function send(){
			//console.log("trying to send in api/message:",message);
			
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
						console.log("---bazinga2"+name,message);
						if(gateways[name] && gateways[name].send)
							gateways[name].send(message, list[name]);
					}
				}
			);
			console.log(message);
			gateways.http.send(message, [message.to]);
		}

		if (message.auth) {
			gateways[message.auth.gateway].auth(message.auth,function(status,response) {
				cb(status,response);
				if (status==false) {
					console.log(response.err);
					return;
				}
				/*
				 *
				 *done in the socket.js with the the core.message function. Temp solution.
				db.query("select id from rooms where id=?",[response[0].room],function(err,room){
					delete message.auth;
					message.ref=room[0].id;
					send();
				});
				*/
			});
		}
		else {
			send();
		}
	});
};
