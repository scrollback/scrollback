"use strict";

var irc = require("irc"),
	isEcho = require("../../lib/isecho.js"),
	log = require("../../lib/logger.js"),
	config = require("../../config.js");

module.exports = connect;

function connect(server, nick, callback) {
	log("Connecting " + nick + " to " + server);
	var client =  new irc.Client(server, nick, {
		userName: 'scrollbot',
		realName: 'scrollback.io',
		debug: false
	});
	
	function room(s) {
		return client.rooms[s.toLowerCase()] || "guest-" + s.substr(1);
	}
	
	function message(type, from, to, text) {
		var msg = {
			type: type, from: from, to: to, text: text,
			time: new Date().getTime()
		};
		if(isEcho("irc", msg)) return;
		if(callback) callback(msg);
	}
	
	client.addListener('raw', function(message) {
		// log("Incoming from " + message.server, message.args);
	});
	
	client.addListener('error', function(message) {
		log("Error from " + message.server, message.args);
	});
	
	if(callback) {
		client.addListener('message', function(nick, channel, text) {
			log(client.nick + " hears " + nick + " say \'" +
				text.substr(0,32) + "\' in " + channel);
			message('text', nick, room(channel), text);
		});
		
		client.addListener('join', function(channel, from) {
			log(client.nick + " hears " + from + " joined " + channel);
			if(from !== client.nick) {
				message('join', from, room(channel), '');
			}
		});
		
		client.addListener('part', function(channel, from, reason) {
			log(client.nick + " hears " + from + " left " + channel);
			if(from !== client.nick) {
				message('part', from, room(channel), reason);
			}
		});
		
		client.addListener('quit', function(from, reason, channels) {
			var i, l;
			for(i=0, l=channels.length; i<l; i++) {
				message('part', from, room(channels[i]), reason);
			}
		});
	}
	
	// Send queued messages when join happens.
	client.addListener('join', function(channel, from) {
		if (from === client.nick && client.sayQueues[channel]) {
			log("Sending queued messages for " + channel);
			client.sayQueues[channel].forEach(function(message) {
				client.say(channel, message);
			});
		}
	});
	
	client.addListener('registered', function() {
		log(client.nick + " is connected to " + server);
		client.connected = true;
		
		// Send any queued join's.
		client.joinQueue.forEach(function(channel) {
			log("Joining " + channel + " (queued).");
			client.join(channel);
		});
	});
	
	// When parted all channels, disconnect.
	client.addListener('part', function() {
		if(message.from === client.nick) process.nextTick(function (){
			if(Object.keys(client.chans).length === 0) {
				log("Last channel parted. Disconnecting from " + client.opt.server);
				client.disconnect();
				delete clients[message.from][u.host];
			}
		});
	});

	
	client.joinQueue = [];
	client.sayQueues = {};
	
	// Wrap the client's say function in a queuing wrapper
	client.say = (function(say) {
		return function(channel, message) {
			if (!client.connected || !client.chans[channel]) {
				log("Queuing " + message.substr(1,32) + " for " + channel + ".");
				
				if (!client.sayQueues[channel]) {
					client.sayQueues[channel] = [];
				}
				client.sayQueues[channel].push(message);
			} else {
				log("Sending " + message.substr(1,32) + " to " + channel + " directly.");
				say.apply(this, arguments);
			}
			
		};
	}(client.say));
	
	// Wrap the client's join function in a queuing wrapper
	client.join = (function(join) {
		return function(channel) {
			if (!client.connected) {
				log("Queuing join " + channel);
				client.joinQueue.push(channel);
			} else {
				log("Joining " + channel);
				join.apply(this, arguments);
			}
		};
	}(client.join));
	
	client.connected = false;
	client.rooms = {};

	return client;
}

