/*
	the irc accounts are updated right away.
	There is a performance issue though.
	The old client objects of all the individual users are not removed.
*/

/* global require, module, __dirname, console */
var irc = require("irc"),core,
	config = require("../config.js"),
	url = require("url"),
	connect = require("./connect.js"),
	log = require("../lib/logger.js"), fs = require("fs"),
	jade = require("jade"),
	crypto = require('crypto');
var db = require("../lib/mysql.js");


var botNick=config.irc.nick, clients = {bot: {}}, users = {};
var nickFromUser = {}, userFromSess = {};
module.exports = function(object){
	core = object;
	fs.readFile(__dirname + "/irc.html", "utf8", function(err, data){
		if(err)	throw err;
		core.on("http/init", function(payload, callback) {
            payload.irc = {
				config: data
			};
			callback(null, payload);
        }, "setters");
	});
	init();
	core.on("room", function(room, callback) {
		var i=0,l;
		log("Heard \"room\" Event");
		if(room.type == "room") {
			// just validation.
			if(room.accounts) room.accounts.forEach(function(account) {
				var u = url.parse(account.id);
				var id = u.protocol+"//"+u.host+"/";
				if(!u.hash) {
					if(u.path.substring(1)) {
						id = id+"#"+u.path.substring(1);
					}
					else {
						return callback({message:"invalid irc account"});
					}
				}else {
					id = id+u.hash;
				}
				account.id = id;
			});

			log("OLD ACCOUNTs",room.old);
			if(room.old && room.old.accounts) room.old.accounts.forEach(function(oldAccount) {
				if (oldAccount.gateway === 'irc') {
					var u;
					if(room.accounts) {
						for (i=0,l=room.accounts.length;i<l;i++ )
							if(room.accounts[i].id == oldAccount.id) return;
					}
					u = url.parse(oldAccount.id);
					clients.bot[u.host].part(u.hash.toLowerCase());
					delete clients.bot[u.host].rooms[u.hash.toLowerCase()];
				}
				
			});


			if(room.accounts) room.accounts.forEach(function(account) {
				var u = url.parse(account.id);
				if (account.gateway === 'irc') {
					if(!clients.bot[u.host] || !clients.bot[u.host].rooms[u.hash.toLowerCase()]) {
						addBot(account);
					}
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
	client = addBotChannels(u.host, [u.hash.toLowerCase()]);
	client.rooms[u.hash.toLowerCase()] = account.room;
	account.joined = true;
}

function addBotChannels(host, channels) {
	log("ADD_BOT_CHANNELS", host, channels);
	
	var client = clients.bot[host];
	if(!client) {
		clients.bot[host] = client =
			connect(host, botNick, botNick, channels, function(m) {
				var sessionID = "irc://"+m.origin.server+"/"+m.from;
				if (users[host] && users[host][m.from]) {
					log("Incoming Echo", m);
					return;
				}
				if(m.type == "back") {
					if(userFromSess[sessionID]) {
						m.from = userFromSess[sessionID];
						core.emit("message", m);
					}else {
						core.emit("init", {session: sessionID, suggestedNick: m.from}, function(err, data) {
							userFromSess[sessionID] = data.user.id;
							nickFromUser[data.user.id] = m.from
							m.from = data.user.id;
							core.emit("message", m);
						});
					}
				}else if(m.type == 'nick') {
					core.emit("init", {sessionID: sessionID, suggestedNick: m.ref}, function(err, data) {
						m.from = userFromSess[sessionID];
						delete nickFromUser[userFromSess[sessionID]];
						delete userFromSess[sessionID];
						userFromSess["irc://"+m.origin.server+"/"+m.ref] = data.user.id;
						nickFromUser[data.user.id] = m.ref;
						m.ref = data.user.id;
						core.emit("message", m);	
					});
				}else if(m.type == 'away'){
					if(!userFromSess[sessionID]) return;
					m.from = userFromSess[sessionID];
					delete nickFromUser[userFromSess[sessionID]];
					delete userFromSess[sessionID];
					core.emit("message", m);
				}
				else {
					m.from = userFromSess[sessionID] || m.from;
					core.emit("message", m);
				}
			});

		client.on('nick', function(oldn, newn) {
			if (users[host][oldn]) {
				users[host][newn] = true;
				delete users[host][oldn];
			}
		});
		
	}else{
		channels.forEach(function(room){
			client.join(room);	
		});
	}
	if (!users[host]) users[host] = {};
	
	return client;
}

function init() {
	var servchan = {};
	
	db.query("SELECT * FROM `accounts` WHERE `gateway`='irc'", function(err, data) {
		if(err) throw "Cannot retrieve IRC accounts";
		var host, client;
		
		data.forEach(function(account) {
			var u = url.parse(account.id);
			if(!servchan[u.host]) servchan[u.host] = {};
			servchan[u.host][u.hash.toLowerCase()] = account.room;
		});
		
		for(host in servchan) {
			client = addBotChannels(host, Object.keys(servchan[host]));
			client.rooms = servchan[host];
		}
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
					clients[message.from][u.host] = client = connect(u.host, message.from, ident, []);

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
				if (message.text.indexOf("/me ") === 0) {
					client.action(channel,message.text.substring(4));
				}
				else{
					client.say(channel, message.text);
				}
				break;
			case 'away':
//				if (!client) return;
//				log("Start countdown " + (client && client.nick) + " leaving " + channel);
//				client.timers['part-' + channel] = setTimeout(function() {
					if (client && client.chans[channel]) {
						log("Sending " + client && client.nick + " parts " + channel);
						client.part(channel);
						delete client.rooms[channel.toLowerCase()];
					}
//				}, config.irc.hangTime);
				break;
			case 'back':
//				if (client && client.timers['part-' + channel]) {
//					log("Abort countdown " + (client && client.nick) + " leaving " + channel);
//					clearTimeout(client.timers['part-' + channel]);
//				}
				break;
			case 'nick':
				var nick=message.ref;

				nick=(nick.indexOf("guest-")===0)?(nick.replace("guest-","")):nick;
				clients[message.from][u.host] = client;
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
