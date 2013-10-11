"use strict";

var irc = require("irc"),
	core = require("../../core/core.js"),
	config = require("../../config.js"),
	db = require("mysql").createConnection(config.mysql),
	url = require("url"),
	connect = require("./connect.js"),
	log = require("../../lib/logger.js"), fs = require("fs"),
	jade = require("jade");


var botNick=config.irc.nick, clients = {bot: {}}, users = {};


module.exports = function(core){
	var pluginContent = "";

	fs.readFile(__dirname + "/irc.jade", "utf8", function(err, data){
		if(err)	throw err;
		pluginContent = jade.compile(data,  {basedir: process.cwd()+'/plugins/http/views/' });
		core.setConfigUi("irc", function(object){
			return pluginContent(object);
		});
	});
	init();
	core.on("message" , function(message , callback){
			db.query("SELECT * FROM `accounts` WHERE `room` IN (?)", [message.to], function(err, data) {
			var i, l, name, list = {};
			if(err) return callback(err);
			for(i=0, l=data.length; i<l; i+=1) {
				name = data[i].gateway;
				if(!list[name]) list[name] = [];
				list[name].push(data[i].id);
			}
			for(name in list) {
				send(message, list[name]);
			}
		});
		callback();
	});
	
};

function init() {
	console.log("IRC accounts available");
	db.query("SELECT * FROM `accounts` WHERE `gateway`='irc'", function(err, data) {
		if(err) throw "Cannot retrieve IRC accounts";
		//db.end();

		function joinStuff() {
			data.forEach(function(account) {
				var u, client;
				if(account.joined) return;
				u = url.parse(account.id);
				console.log("URL:",u);
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
				client.join(u.hash.toLowerCase());
				client.rooms[u.hash.toLowerCase()] = account.room;
				account.joined = true;
			});
		}
		
		joinStuff();
	});
	connect.init(users);
}

function send(message, accounts) {
	clients[message.from] = clients[message.from] || {};
	accounts.map(function(account) {
		console.log("Account:",account);
		var u = url.parse(account);
			var client = clients[message.from][u.host],
			channel = u.hash.toLowerCase();
		
		if (message.origin.gateway == "irc" && ("irc://"+message.origin.server+"/"+message.origin.channel).toLowerCase() == (account || "").toLowerCase()) {
			log("Outgoing echo", message);
			return;
		}
		switch(message.type) {
			case 'text':
				if(!client) {
					clients[message.from][u.host] = client = connect(
						u.host, message.from,
						message.origin.ip.split('.').map(function(d) {
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
				//check for "/me "
				if (message.text.indexOf("/me ")==0) {
					client.action(channel,message.text.substring(4));
				}
				else{
					client.say(channel, message.text);
				}
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
				console.log("users",users, u.host, message.ref);
				users[u.host][message.ref] = true;
				
				if(client) client.rename(nick);
				break;
		}
	});
	if(message.type == "nick") {
		clients[message.ref]=clients[message.from];
		delete clients[message.from];
	}
}

