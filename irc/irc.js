"use strict";
/*
	the irc accounts are updated right away.
	There is a performance issue though.
	The old client objects of all the individual users are not removed.
*/
var irc = require("irc"),core,
	config = require("../config.js"),
	url = require("url"),
	connect = require("./connect.js"),
	log = require("../lib/logger.js"), fs = require("fs"),
	jade = require("jade"),
	crypto = require('crypto');
var db = require("../lib/mysql.js");


var botNick=config.irc.nick, clients = {bot: {}}, users = {};

module.exports = function(object){
	var pluginContent = "";
	core = object;
	fs.readFile(__dirname + "/irc.html", "utf8", function(err, data){
		if(err)	throw err;
		core.on("config", function(payload, callback) {
            payload.irc = data;
            callback(null, payload);
        }, "setters");
	});
	init();
	core.on("room", function(room, callback) {
		var i=0,l;
		log("Heard \"room\" Event");
		if(room.type == "room") {
			// just validation.
			room.accounts && room.accounts.forEach(function(account) {
				var u = url.parse(account.id);
	            var id = u.protocol+"//"+u.host+"/";
	            if(!u.hash) {
	            	console.log("no hash");
	            	if(u.path.substring(1)) {
	            		console.log("has path");
	                	id = id+"#"+u.path.substring(1)
					}
					else {
						console.log("--------------------invalid");
						return callback(err,{message:"invalid irc account"});
					}
				}else {
					id = id+u.hash;
				}
				account.id = id;
			});

			log("OLD ACCOUNTs",room.old);
			room.old && room.old.accounts && room.old.accounts.forEach(function(oldAccount) {
				var u;
				if(room.accounts) {
					for (i=0,l=room.accounts.length;i<l;i++ )
						if(room.accounts[i].id == oldAccount.id) return;
				}
				u = url.parse(oldAccount.id);
				clients.bot[u.host].part(u.hash.toLowerCase());
				delete clients.bot[u.host].rooms[u.hash.toLowerCase()];
			});


			room.accounts && room.accounts.forEach(function(account) {
				var u = url.parse(account.id);
				if(!clients.bot[u.host] || !clients.bot[u.host].rooms[u.hash.toLowerCase()]) {
					addBot(account);
				}
			});
		}
		callback();
	}, "gateway");
	core.on("message" , function(message , callback) {
		log("Heard \"message\" Event");
		db.query("SELECT * FROM `accounts` WHERE `room` IN (?) AND `gateway`='irc'", [message.to], function(err, data) {
			var i, l, name, list = [], u;
			if(err) return callback(err);
			for(i=0, l=data.length; i<l; i+=1) {
				u = url.parse(data[i].id);
				if(!clients.bot[u.host] || !clients.bot[u.host].rooms[u.hash.toLowerCase()]) {
					addBot(data[i]);
				}
				list.push(data[i].id);
			}
			send(message, list);
		});
		callback();
	}, "gateway");
};

function addBot(account) {
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

				core.emit("message", m);
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
}

function init() {
	db.query("SELECT * FROM `accounts` WHERE `gateway`='irc'", function(err, data) {
		if(err) throw "Cannot retrieve IRC accounts";
		function joinStuff() {
			data.forEach(addBot);
		}
		joinStuff();
	});
	connect.init(users);
}

function send(message, accounts) {
	var ident = "", md5sum = crypto.createHash('md5');
	clients[message.from] = clients[message.from] || {};
	accounts.map(function(account) {
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
					//when an replaced irc connection's client is still active. msgs must be ignored.
					if(message.origin.ip) {
						ident = message.origin.ip.split('.').map(function(d) {
							var h = parseInt(d, 10).toString(16);
							if (h.length < 2) h = '0'+h;
							return h;
						}).join('').toUpperCase();
					}
					else {
						ident =  md5sum.update(JSON.stringify(message.origin)).digest("hex");
					}
					clients[message.from][u.host] = client = connect(u.host, message.from,ident);

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
