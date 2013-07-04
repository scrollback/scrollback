"use strict";

var irc = require("irc"),
	core = require("../../core/core.js"),
	config = require("../../config.js"),
	db = require("mysql").createConnection(config.mysql),
	url = require("url"),
	connect = require("./connect.js"),
	isEcho = require("../../lib/isecho.js"),
	log = require("../../lib/logger.js");

var botNick=config.irc.nick, clients = {bot: {}};

exports.init = init;
exports.send = send;

function init() {
	db.query("SELECT * FROM `accounts` WHERE `gateway`='irc'", function(err, data) {
		if(err) throw "Cannot retrieve IRC accounts";
		
		function joinStuff() {
			data.forEach(function(account) {
				var u, client;
				if(account.joined) return;
				u = url.parse(account.id);
				client = clients.bot[u.host];
				
				if(!client) {
					clients.bot[u.host] = client =
						connect(u.host, botNick, core.send);
					client.addListener('registered', joinStuff);
				} else if(client.connected){
					log("Bot joining " + u.hash);
					client.join(u.hash);
					client.rooms[u.hash.toLowerCase()] = account.room;
					account.joined = true;
				}
			});
		}
		
		joinStuff();
	});
}

function send(message, accounts) {
	clients[message.from] = clients[message.from] || {};
	if(isEcho("irc", message)) return;
	accounts.map(function(account) {
		var u = url.parse(account),
			client = clients[message.from][u.host],
			channel = u.hash;
			
		switch(message.type) {
			case 'join':
				if(!client) {
					clients[message.from][u.host] = client = connect(u.host, message.from);
					var disconnect = function() { delete clients[message.from][u.host]; };
					client.on('quit', disconnect);
					client.on('kill', disconnect);
				}
				
				client.join(channel);
				client.rooms[channel.toLowerCase()] = message.to;
				break;
			case 'text':
				client.say(channel, message.text);
				break;
			case 'part':
				log(client && client.nick + " parts " + channel);
				if(client && client.chans[channel]) {
					client.part(channel);
					delete client.rooms[channel.toLowerCase()];
				}
				break;
		}
	});
}

