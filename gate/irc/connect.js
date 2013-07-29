"use strict";

var irc = require("irc"),
	log = require("../../lib/logger.js"),
	config = require("../../config.js"),
	ident=require("./ident.js"),
	users;

module.exports = connect;


function connect(server, nick, uid, callback) {
	log("Connecting " + nick + " to " + server);

	
	// Code for stripping out the guest from the username
	nick=(nick.indexOf("guest-")===0)?(nick.replace("guest-","")):nick;
	
	var client =  new irc.Client(server, nick, {
		userName : nick,
		realName: nick+'@scrollback.io',
		debug: false
	});
	
	function room(s) {
		return client.rooms[s.toLowerCase()] || "guest-" + s.substr(1);
	}
	
	function message(type, from, to, text, channel, ref) {
		var msg = {
			type: type, from: from, to: to, text: text,
			time: new Date().getTime(), origin: 'irc://' + server + '/' + channel,
			ref: ref
		};
		
		if(callback) callback(msg);
	}
	
	client.conn.on("connect",function(){
		ident.register(this.address().port,this.remotePort,uid);
	});
	
	client.conn.on("disconnect", function() {
		ident.remove(this.address().port,this.remotePort);		
	});
	
	client.addListener('raw', function(message) {
		log("Incoming from " + message.server, message.args);
	});
	
	client.addListener('error', function(message) {
		log("Error from " + message.server, message.args);
	});				
	
	if(callback) {
		client.addListener('message', function(nick, channel, text) {
			
			// if a user name not registered with askabt, connects via IRC, he is made a  guest.
			if(!(users[client.opt.server] && users[client.opt.server][nick]))
				nick = "guest-" + nick; 
			

			log(client.nick + " hears " + nick + " say \'" +
				text.substr(0,32) + "\' in " + channel);
			message('text', nick, room(channel), text, channel);
		});
		
		client.addListener('join', function(channel, from) {
			log(client.nick + " hears " + from + " joined " + channel);
			if(from !== client.nick) {
				message('back', from, room(channel), '', channel);
			}
		});
		
		client.addListener('nick', function(oldn, newn) {
			message('nick', oldn, '', '', '', newn);
		});
		
		client.addListener('part', function(channel, from, reason) {
			log(client.nick + " hears " + from + " left " + channel);
			if(from !== client.nick) {
				message('away', from, room(channel), reason, channel);
			}
		});
		
		client.addListener('kick', function(channel, from, reason) {
			log(client.nick + " hears " + from + " left " + channel);
			if(from !== client.nick) {
				message('away', from, room(channel), reason, channel);
			}
		});
		
		client.addListener('quit', function(from, reason, channels) {
			var i, l;
			for(i=0, l=channels.length; i<l; i++) {
				message('away', from, room(channels[i]), reason, channels[i]);
			}
		});
		
		client.addListener('kill', function(from, reason, channels) {
			var i, l;
			for(i=0, l=channels.length; i<l; i++) {
				message('away', from, room(channels[i]), reason, channels[i]);
			}
		});
	}
	
	// Send queued messages when join happens.
	client.addListener('join', function(channel, from) {
		channel = channel.toLowerCase();
		if (from === client.nick && client.sayQueues[channel]) {
			log("Sending queued messages for " + channel);
			client.sayQueues[channel].forEach(function(message) {
				client.say(channel, message);
			});
			client.sayQueues[channel] = [];
		}
	});
	
	client.addListener('registered', function() {
		log(client.nick + " is connected to " + server);
		client.connected = true;
		
		// Perform queued actions.
		client.connQueue.forEach(function(action) {
			log("Dequeueing", action.args);
			action.oper.apply(client, action.args);
		});
		
		client.connQueue = [];
	});
	
	// When parted all channels, disconnect.
	client.addListener('part', function() {
		if(message.from === client.nick) process.nextTick(function (){
			if(Object.keys(client.chans).length === 0) {
				log("Last channel parted. Disconnecting from " + client.opt.server);
				client.disconnect();
			}
		});
	});

	client.connQueue = [];
	client.sayQueues = {};
	
	// Wrap the client's say function in a queuing wrapper
	client.say = (function(say) {
		return function(channel, message) {
			channel = channel.toLowerCase();
			if (!client.connected || !client.chans[channel]) {
				log("Queueing " + message.substr(0,32) + " for " + channel + ".");
				if (!client.sayQueues[channel]) {
					client.sayQueues[channel] = [];
				}
				client.sayQueues[channel].push(message);
			} else {
				log("Sending " + message.substr(0,32) + " to " + channel + ".");
				say.apply(this, arguments);
			}
		};
	}(client.say));
	
	// Generic wrapper that wraps operations to do when the server connects.
	
	function queueConn(oper, callback) {
		return function() {
			if (!client.connected) {
				log("Queueing ", arguments);
				client.connQueue.push({oper: oper, args: arguments});
			} else {
				if (callback) callback.apply(this, arguments);
				oper.apply(this, arguments);
			}
		};
	}
	
	client.join = queueConn(client.join);
	client.part = queueConn(client.part);
	client.rename = queueConn(function(nick) {
		log("Sending nick change to irc");
		client.send("NICK", nick);
	});
	
	client.connected = false;
	client.rooms = {};
	client.timers = {};

	return client;
}

connect.init = function(urs) {
	users=urs;
	ident.init();
};
