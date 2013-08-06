"use strict";

var irc = require("irc"),
	core = require("../../core/core.js"),
	config = require("../../config.js"),
	db = require("mysql").createConnection(config.mysql),
	url = require("url"),
	connect = require("./connect.js"),
	log = require("../../lib/logger.js");

var botNick=config.irc.nick, clients = {bot: {}}, users = {};

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
						connect(u.host, botNick, botNick, function(m) {
							if (users[u.host] && users[u.host][m.from]) {
								log("Incoming Echo", m);
								return;
							}
							core.message(m);
						});
						
					client.on('nick', function(oldn, newn) {
						if (users[u.host][oldn]) {
							users[u.host][newn] = true;
							delete users[u.host][oldn];
						}
					});
				}
				if (!users[u.host]) users[u.host] = {};
				
				log("Bot joining " + u.hash);
				client.join(u.hash);
				client.rooms[u.hash.toLowerCase()] = account.room;
				account.joined = true;
			});
		}
		
		joinStuff();
	});
	connect.init(users);
}

function send(message, accounts) {
	
	
	
	//console.log("trying to send in irc:",message);
	clients[message.from] = clients[message.from] || {};
	accounts.map(function(account) {
		var u = url.parse(account),
			client = clients[message.from][u.host],
			channel = u.hash;
		
		if (message.origin == account) {
			log("Outgoing echo", message);
			return;
		}
		
		console.log(clients[message.from]);
		switch(message.type) {
			case 'text':
				if(!client) {
					clients[message.from][u.host] = client = connect(
						u.host, message.from,
						message.origin.replace('web://', '').split('.').map(function(d) {
							var h = parseInt(d, 10).toString(16);
							if (h.length < 2) h = '0'+h;
							return h;
						}).join('').toUpperCase()
					);
					var disconnect = function(nick) {
						if (nick !== client.nick || Object.keys(client.chans).length) return;
						delete clients[message.from][u.host];
						delete users[u.host][client.nick];
					};
					client.on('quit', disconnect);
					client.on('kill', disconnect);
					client.on('registered', function() {
						if (!users[u.host]) users[u.host] = {};
						users[u.host][client.nick] = true;
					});
				}
				if (!client.chans[channel]) {
					client.join(channel);
					client.rooms[channel.toLowerCase()] = message.to;
				}
				client.say(channel, message.text);
				break;
			case 'away':
				if (!client) return;
				log("Start countdown " + (client && client.nick) + " leaving " + channel);
				client.timers['part-' + channel] = setTimeout(function() {
					log("Sending " + client && client.nick + " parts " + channel);
					if (client && client.chans[channel]) {
						client.part(channel);
						delete client.rooms[channel.toLowerCase()];
					}
				}, config.irc.hangTime);
				break;
			case 'back':
				if (client && client.timers['part-' + channel]) {
					log("Abort countdown " + (client && client.nick) + " leaving " + channel);
					clearTimeout(client.timers['part-' + channel]);
				}
				break;
			case 'nick':
				var nick=message.ref;
				
				nick=(nick.indexOf("guest-")===0)?(nick.replace("guest-","")):nick;
				clients[message.from][u.host] = client
				clients[message.ref]=clients[message.from];
				users[u.host][message.ref] = true;
				
				if(client) client.rename(nick);
				clients[message.ref]=clients[message.from];
				
				delete clients[message.from];
				break;
		}
	});
}

