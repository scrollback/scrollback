var net = require('net');
var irc = require('irc');
var config = require("../config.js");
var clients = {};
var botNick ;
var nicks = {};//used to store callback of rename event.
var core;
var serverBotNicks = {};//server bot nick map.
var roomServChan = {};
var servChanRoom = {};
var roomUser = {};
var nickServerChannel = {};
var servUsers = {};//irc server, username --> scrollback username
module.exports.connectBot = connectBot;
module.exports.connectUser = connectUser;
module.exports.part = part;
module.exports.partUser = partUser;
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
 *Server already connected.
 */
function joinChannels(server, nick, channels, cb) {
	var client = clients[nick][server];
	channels.forEach(function(channel) {
		if (client.opt.channels.indexOf(channel) === -1) {
			client.join(channel);
		}
	});
	cb();
	return client;
}
/**
 *Join server if not connected already.
 */
function joinServer(server, nick, channels, options, cb) {
	if (!clients[nick]) clients[nick] = {}; 
	var client = new irc.Client(server, nick, {
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
	console.log("client=", client);
	clients[nick][server] = client;
	client.conn.on("connect", cb);
	return client;
}

/**
 *always actual nick will be used for identify a user
 *opt.identId is used for ident.
 */
function connectBot(room, bn, server, channel, options, cb) {
	roomServChan[room] = {server: server, channel : channel};
	if(!servChanRoom[server]){
		servChanRoom[server] = {};
		if(!servChanRoom[server][channel]) servChanRoom[server][channel] = [];
	}
	servChanRoom[server][channel].push(room);
	botNick = bn;
	var client;
	if (!clients[botNick]) clients[botNick] = {}; 
	if (clients[botNick][server]) {//already connected to server.
		joinChannels(server, botNick, [channel], cb);
	} else {
		client = joinServer(server, botNick, [channel], options, cb);
		//onNames(client);
		//onRaw(client);
		onMessage(client);
		//onPM(client);
		//onError(client);
		//onJoin(client);
		//onNick(client);
		//onRegistered(client);
		//onPart(client);
		//onKill(client);
		//onKick(client);
		//onQuit(client);
	}
}

function connectUser(room, nick, server, channels, options, cb) {
	var client;
	if (!clients[nick]) clients[nick] = {};
	if (clients[nick][server]) {
		client = joinChannels(server, nick, channels,cb);
	} else {
		client = joinServer(server, nick, channels, options,cb);
		roomUser[room][user] = client;
		onPartUser(client);
		onRegistered(client);
	}
}

function onRegistered(client) {
	client.addListener('registered', function(message) {
		console.log("after reg:" , client);
		core.emit('data', {
			type: 'registered',
			server: client.opt.server,
			nick: client.nick,
			message: message			
		});
	});
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
		servChanRoom[client.opt.server][from].forEach(function(room) {
			core.emit('data', {
				type: 'message',
				server: client.opt.server,
				to: room,
				from: servUsers[from], 
				message: message
			});
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
			console.log("disconnecting.............................", client.opt.server);
			client.disconnect();
			delete clients[client.opt.server];
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

function onKill(client) {
	client.addListener('kill', function (nick, reason, channels, message)  {
		core.emit('data', {
			type: 'kill',
			server: client.opt.server,
			channels: channels,
			reason: reason,
			message: message
		});
	});
}

function onQuit(client) {
	client.addListener('quit', function (nick, reason, channels, message)  {
		core.emit('data', {
			type: 'quit',
			server: client.opt.server,
			channels: channels,
			reason: reason,
			message: message
		});
	});
}

function onKick(client) {
	client.addListener('kick', function (channel, nick, by, reason, message)  {
		core.emit('data', {
			type: 'kick',
			server: client.opt.server,
			channel: channel,
			nick: nick,
			by: by,
			reason: reason,
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



function part(server, channel) {
	var client = clients[myNick][server];
	client.part(channel);
}


function partUser(server, nick, channel) {
	var client = userClients[nick][server];
	client.part(channel);
}

function onPartUser(client) {
	client.on('part', function() {
		if (client.opt.channels.length === 0) {
			client.disconnect();
			delete clients[client.nick][client.opt.server];
		}
	});
}

//text and action message
function say(server, nick , channel, message) {
	clients[nick][server].say(channel, message);
}

/**
 *@param oldNick old actual nick
 *@param{string} newNick try to rename to new nick of generate suggestion based on new nick. 
 *callback(nick) with assiged new nick
 */
function rename(server, oldNick, newNick, cb) {
	var client = clients[oldNick][server];
	client.rename(newNick);
	delete clients[oldNick][server];
	if (!clients[newNick]) clients[newNick] = {};
	client.nick = newNick;
	clients[newNick][server] = client;
	nicks[oldNick] = cb;	
}

/**
 *to send actual raw message to server.
 */
function sendRawMessage(server, nick,  message) {
	var client = clients[nick][server];
	client.send(message);
}

/**
 *Return list of users.
 */
function whois(server, nick, callback) {
	var client = clients[myNick][server];
	client.whois(nick, callback);
}


