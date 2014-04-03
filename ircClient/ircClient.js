var net = require('net');
var irc = require('irc');
var config = require("../config.js");
var clients = {};
var myNick = "testing";//TODO move this to config.
var userClients = {};
var nicks = {};//used to store callback of rename event.
var core;
module.exports.connectBot = connectBot;
module.exports.connectUser = connectUser;
module.exports.leave = leave;
module.exports.say = say;
module.exports.sendRawMessage = sendRawMessage;
module.exports.whois = whois;
module.exports.rename = rename;
module.exports.init = function init(coreObj) {
	core = coreObj;
};

/******************************************
TODO's 

******************************************/

/**
 *always actual nick will be used for identify a user
 *opt.identId is used for ident.
 *myNick will be config of new IRC client
 */
function connectBot(server, channels, options, cb) {
	var client;
	if (clients[server]) {//already connected to server.
		client = clients[server];
		channels.forEach(function(channel) {
			if (client.opt.channels.indexOf(channel) === -1) {//if not connected.
				client.join(channel);
			}
		});
		cb();//Is there a better way?
	} else {
		console.log("Trying to connect to :", server, channels);
		client = new irc.Client(server, myNick, {
			userName : myNick,
			realName: myNick + '@scrollback.io',//TODO use identId
			channels: channels,
			debug: false,
			stripColors: true,
			floodProtection: true,
			identId: options.identId,
			webircPassword: options.webircPassword,
			userIp : options.userIp,
			userHostName: options.userHostName
		});
		clients[server] = client;
		onNames(client);
		onRaw(client);
		onMessage(client);
		onPM(client);
		onError(client);
		onJoin(client);
		onPart(client);
		onNick(client);
		client.conn.on("connect", cb);
	}
}

function onRaw(client) {
	client.on('raw', function(raw) {
		core.emit('data', {
			type: 'raw',
			server: client.opt.server,
			data: raw
		});
	});
}

function onMessage(client) {
	client.on('message', function(to, from, message) {
		console.log("on message");
		core.emit('data', {
			type: 'message',
			server: client.opt.server,
			to: to,
			from: from,
			message: message
		});
	});
}

function onPM(client) {
	client.on('pm', function(to, from, message) {
		core.emit('data', {
			type: 'pm',
			server: client.opt.server,
			to: to,
			from: from,
			message: message
		});
	});
}

function onError(client) {
	client.on('error', function(message) {
		core.emit('data', {
			type: 'message',
			server: client.opt.server,
			message: message
		});
	});
}

function onPart(client) {
	client.on("part", function(channel, nick, reason, message){//TODO delete client if no more connections
		if(client.opt.channels.length === 0) {
			client.disconnect();
			
		}
		core.emit('data', {
			type: 'part',
			server: client.opt.server,
			channel: channel,
			nick: nick,
			message: message,
			reason: reason
		});
		
	});
}

function onJoin(client) {
	client.on('join', function(channel, nick, message) {
		core.emit('data', {
			type: 'join',
			server: client.opt.server,
			channel: channel,
			nick: nick,
			message: message
		});
	});
}

function onNick(client) {
	client.addListener('nick', function (oldNick, newNick, channels, message)  {
		if (nicks[oldNick]) {
			nicks[oldNick](newNick);
			delete nicks[oldNick];
		}
		core.emit('data', {
			type: 'nick',
			server: client.opt.server,
			channels: channels,
			oldNick: oldNick,
			newNick: newNick,
			message: message
		});
	});
}

/**
 *List of names send by server for channel
 */
function onNames(client) {
	client.on('names', function(channel, nicks) {
		core.emit('data', {
			type: 'names',
			server: client.opt.server,
			channel: channel,
			nicks: nicks
		});
	});
}



function connectUser(server, nick, channels,options, cb) {
	var client;
	if (!userClients[nick]) userClients[nick] = {};
	if (userClients[nick][server]) {
		client = userClients[nick][server];
		channels.forEach(function(channel) {
			if (client.opt.channels.indexOf(channel) === -1) {
				client.join(channel);
			}
		});
		cb();
	} else {
		client = new irc.Client(server, nick, {
			userName : nick,
			realName: nick + '@scrollback.io',
			channels: channels,
			debug: false,
			stripColors: true,
			floodProtection: true,
			identId: options.identId,
			webircPassword: options.webircPassword,
			userIp : options.userIp,
			userHostName: options.userHostName
		});
		userClients[nick][server] = client;
		client.conn.on("connect", cb);
	}
}


function leave(server, channel) {
	var client = clients[server];
	client.part(channel);
	if (client.opt.channels.length === 0) {
		client.disconnect();
		delete client[server];
	}
	
}


function leaveUser(server, nick, channel) {
	var client = userClients[nick][server];
	client.part(channel);
	if (client.opt.channels.length === 0) {
		client.disconnect();
		delete userClients[nick][server];
	}
	
}



function onDisconnect(client) {
	client.on("disconnect", function() {
		if (client.opt.userName === myNick) {
			delete clients[client.opt.server]; 
		} else {
			delete userClients[client.opt.server][client.opt.userName];
		}
	});
}


//text and action message
function say(server, nick , channel, message) {
	userClients[nick][server].say(channel, message);
}

/**
 *@param oldNick old actual nick
 *@param{string} newNick try to rename to new nick of generate suggestion based on new nick. 
 *callback(nick) with assiged new nick
 */
function rename(server, oldNick, newNick, cb) {
	var client = userClients[oldNick][server];
	client.rename(newNick);
	delete userClients[oldNick][server];
	if (!userClients[newNick]) userClients[newNick] = {};
	userClients[newNick][server] = client;
	nicks[oldNick] = cb;	
}





/**
 *to send actual raw message to server.
 */
function sendRawMessage(server, nick,  message) {
	var client = userClients[server][nick];
	client.send(message);
}

/**
 *Return list of users.
 */
function whois(server, nick, callback) {
	var client = clients[server];
	client.whois(nick, callback);
}


