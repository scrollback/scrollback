var irc = require("irc"),
	core = require("../../core/core.js"),
	config = require("../../config.js"),
	db = require("mysql").createConnection(config.mysql),
	url = require("url"),
	isEcho = require("../../lib/isecho.js");

var botNick=config.irc.nick, clients = {bot: {}};

exports.init = init;
exports.send = send;

function init() {
	var i, l, serv, chan;
	
	db.query("SELECT * FROM `accounts` WHERE `gateway`='irc'", function(err, data) {
		if(err) throw "Cannot retrieve IRC accounts";
		
		function joinStuff() {
			data.map(function(account) {
				var u, client;
				if(account.joined) return;
				u = url.parse(account.id);
				client = clients.bot[u.host];
				
				if(!client) {
					clients.bot[u.host] = client =
						connect(u.host, botNick, core.send);
					client.addListener('registered', joinStuff);
				} else if(client.connected){
					console.log("Bot joining " + u.hash);
					client.join(u.hash);
					client.rooms[u.hash] = account.room;
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
					client.addListener('part', function() {
						if(message.from === client.nick) process.nextTick(function (){
							if(Object.keys(client.chans).length === 0) {
								client.disconnect();
								delete clients[message.from][u.host]
							}
						});
					});
				}
				
				if(client.connected) {
					console.log(client.nick + " trying to join " + channel);
					client.join(channel);
					client.rooms[channel.toLowerCase()] = message.to;
					console.log("ROOM INDEX", client.rooms);
				} else {
					console.log("Waiting for registration before joining.");
					client.addListener('registered', function() {
						console.log(client.nick + " trying to join " + channel);
						client.join(channel);
						client.rooms[channel.toLowerCase()] = message.to;
					});
				}
				
				break;
			case 'text':
				if(client && client.chans[channel]) {
					client.say(channel, message.text);
				} else if(client) {
					// Queue messages if join has not happened yet.
					client.addListener('join'+channel, function() {
						client.say(channel, message.text);
					});
				}
				break;
			case 'part':
				console.log(client && client.nick + " parts " + channel);
				if(client && client.chans[channel]) {
					client.part(channel);
					delete client.rooms[channel.toLowerCase()];
				}
				break;
		}
	});
}

function connect(server, nick, callback) {
	console.log("Connecting " + nick + " to " + server);
	var client =  new irc.Client(server, nick, {
		userName: 'sbtester',
		realName: 'sb.tester.io'
		, debug: true
	});
	
	function uh(s) {
		//console.log("Trying to find ", client.rooms, s);
		return client.rooms[s.toLowerCase()] || "guest-" + s.substr(1);
	}
	
	function message(type, from, to, text) {
		var message = {
			type: type, from: from, to: to, text: text,
			time: new Date().getTime()
		};
		if(isEcho("irc", message)) return;
		if(callback) callback(message);
	}
	
	client.addListener('error', function(message) {
		console.log("Error from " + message.server, message.args);
	});
	
	if(callback) {
		client.addListener('message', function(nick, channel, text) {
			console.log(client.nick + " hears " + nick + " say " +
				text.substr(0,32) + " in " + channel);
			message('text', nick, uh(channel), text);
		});
		
		client.addListener('join', function(channel, from) {
			console.log(client.nick + " hears " + from + " joined " + channel);
			if(from !== client.nick) {
				message('join', from, uh(channel), '');
			}
		});
		
		client.addListener('part', function(channel, from, reason) {
			console.log(client.nick + " hears " + from + " left " + channel);
			if(from !== client.nick) {
				message('part', from, uh(channel), reason);
			}
		});
		
		client.addListener('quit', function(from, reason, channels) {
			for(i=0, l=channels.length; i<l; i++) {
				message('part', from, uh(channels[i]), reason);
			}
		});
	}
	
	client.addListener('registered', function() {
		console.log(client.nick + " is connected to " + server);
		client.connected = true;
	});
	
	client.connected = false;
	client.rooms = {};

	return client;
}

