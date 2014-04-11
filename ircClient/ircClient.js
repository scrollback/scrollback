var net = require('net');
var irc = require('irc');
var core;
var botNick ;
var clients = {};//for server channel user,server --> client. 
var servChanProp = {};//object of server channel prop
var rooms = {};//room id to room obj map. //TODO delete room obj if any room deleted irc.
var servNick = {};//server channel nick -------> sb nick.
var serverBotNicks = {};//server bot nick map.

module.exports.connectBot = connectBot;
module.exports.connectUser = connectUser;
module.exports.say = say;
module.exports.sendRawMessage = sendRawMessage;
module.exports.whois = whois;
module.exports.rename = rename;
module.exports.newNick = newNick;
module.exports.init = function init(coreObj) {
	core = coreObj;
};

/******************************************
TODO's 
rename IRC user.
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
	//console.log("client=", client);
	clients[nick][server] = client;
	client.conn.on("connect", cb);
	return client;
}

/**
 *always actual nick will be used for identify a user
 *opt.identId is used for ident.
 *TODO handle bot nick change case.
 */
function connectBot(room, bn, options, cb) {
	var server = room.params.irc.server;
	var channel = room.params.irc.channel;
	rooms[room.id] = room;
	if(!servChanProp[server]) {
		servChanProp[server] = {};
	}
	if (!servChanProp[server][channel]) {
		servChanProp[server][channel] = {};
		servChanProp[server][channel].rooms = [];
		servChanProp[server][channel].users = [];
	}
	servChanProp[server][channel].rooms.push(room);
	if (!servNick[server]) servNick[server] = {};
	botNick = bn;
	var client;
	if (!clients[botNick]) clients[botNick] = {}; 
	if (clients[botNick][server]) {//already connected to server.
		joinChannels(server, botNick, [channel], cb);
	} else {
		client = joinServer(server, botNick, [], options, cb);//after varification connect to channel
		onPM(client);
		onError(client);
		onRaw(client);
		onMessage(client);
		onNames(client);
		onJoin(client);
		onNick(client);
		onRegistered(client);
		onLeave(client);
	}
}

function connectUser(room, nick, options, cb) {
	console.log("room=", room);
	var server = room.params.irc.server;
	var channel = room.params.irc.channel;
	var client;
	if (!clients[nick]) clients[nick] = {};
	if (clients[nick][server]) {
		client = joinChannels(server, nick, [channel],cb);
	} else {
		console.log("connecting user", nick);
		client = joinServer(server, nick, [channel], options,cb);
		client.sbNick = nick;
		client.once('registered', function(message) {
			console.log("registered ........................ :");
			if(!servNick[client.opt.server]) servNick[client.opt.server] = {};	
			servNick[client.opt.server][client.nick] = {nick: client.sbNick, dir: "out"};
		});
	}
}

function onRegistered(client) {
	client.addListener('registered', function(message) {
		
		core.emit('data', {
			type: 'registered',
			server: client.opt.server,
			nick: client.nick,
			message: message			
		});
		
	});
}

function onMessage(client) {
	client.on('message', function(to, from, message) {
		console.log("on message" , JSON.stringify(servNick));
		if (!servChanProp[client.opt.server][from]) {
			return;
		}
		servChanProp[client.opt.server][from].rooms.forEach(function(room) {//TODO not send msg for pending room.
			if (!room.pending) {
				var from;
				if(servNick[client.opt.server][to].dir === 'in') {
					from = servNick[client.opt.server][to].nick;
				} else return;
				core.emit('data', {
					type: 'message',
					server: client.opt.server,
					to: room.id,
					from: from, 
					message: message
				});
			}	
		});
	});
}

function onPM(client) {
	client.on('pm', function(to, from, message) {
		console.log("pm=," , to, from , message);
		var msg = [];
		if (message.args && message.args.length >= 2) {
			msg = message.args[1].split(" ");
		}
		console.log("servChanProp:", JSON.stringify(servChanProp));
		if (msg.length >= 3 && servChanProp[client.opt.server][msg[1]]) {//TODO connect #channel room.
			var r = msg[2];//
			console.log("r=", r);
			client.whois(message.nick, function(reply) {
				console.log("whois reply: ", reply);
				servChanProp[client.opt.server][msg[1]].rooms.forEach(function(room) {
					console.log("room", room);
					if(room.params.irc.pending && room.id === r && reply.channels) {
						console.log("room panding true");
						reply.channels.forEach(function(channel) {
							if (channel.substring(0,1) == '@' && channel.substring(1) === room.params.irc.channel) {
								room.params.irc.pending = false;
								client.join(room.params.irc.channel);
								//TODO send online users of that channel also
								core.emit('data', {type: "room", room: room});
							}
						});
					}
				});
			});
		}
		//core.emit('data', {
		//	type: 'pm',
		//	server: client.opt.server,
		//	to: to,
		//	from: from,
		//	message: message
		//});
	});
}


/************************** user left *****************************************/
/**
 * When client leave the server or channel.
 * @param {Object} client client object
 */
function onLeave(client) {

	client.on("part", function(channel, nick, reason, message){//TODO delete client if no more connections
		
		if(client.opt.channels.length === 0) {
			console.log("disconnecting.............................", client.opt.server);
			client.disconnect();
			delete clients[botNick][client.opt.server];
		}
		left(client, [channel], nick);
		core.emit('data', {
			type: 'part',
			server: client.opt.server,
			channel: channel,
			nick: nick,
			message: message,
			reason: reason
		});
		
	});	
	
	client.addListener('kill', function (nick, reason, channels, message)  {//TODO see if autoconnect after kill
		left(client, channels, nick);
		core.emit('data', {
			type: 'kill',
			server: client.opt.server,
			channels: channels,
			reason: reason,
			message: message
		});
	});

	client.addListener('quit', function (nick, reason, channels, message)  {
		left(client, channels, nick);
		core.emit('data', {
			type: 'quit',
			server: client.opt.server,
			channels: channels,
			reason: reason,
			message: message
		});
	});

	client.addListener('kick', function (channel, nick, by, reason, message)  {
		if(!(servNick[client.opt.server][nick] && servNick[client.opt.server][nick].dir === 'out')) {
			left(client, [channel], nick);
		}
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

function left(client, channels, nick) {
	
	if (servNick[client.opt.server]) {
		delete servNick[client.opt.server][nick];
	}
	channels.forEach(function(channel) {
		var index = servChanProp[client.opt.server][channel].users.indexOf(nick);
		if(index > -1) servChanProp[client.opt.server][channel].users.splice(index, 1);
		servChanProp[client.opt.server][channel].rooms.forEach(function(room) {
			if(!room.params.pending) {
				core.emit("data", {
					type: "away",
					to: room.id,
					from: nick,
					room: room
				});
			}
		});
		
	});
}
/************************** user left *****************************************/

/****************************************** add online irc users ***************/
/**
 * add new member in New member in room 
 */
function addUsers(client, channel, nick) {
	servChanProp[client.opt.server][channel].rooms.forEach(function(room) {
		//save data.
		
		if(nick != client.nick) servChanProp[client.opt.server][channel].users.push(nick);//don't add myNick 
		if(nick != client.nick && !servNick[client.opt.server][nick] &&
			!room.params.irc.pending) {
			core.emit("data", {
				type: "back",
				to: room.id,
				from: nick,
				room: room
			});
		}
	});
}

function onNick(client) {
	client.addListener('nick', function (oldNick, newNick, channels, message)  {
		channels.forEach(function(channel) {
			addUsers(client, channel, newNick);
		});
		left(client, channels, oldNick);
		//core.emit('data', {
		//	type: 'nick',
		//	server: client.opt.server,
		//	channels: channels,
		//	oldNick: oldNick,
		//	newNick: newNick,
		//	message: message
		//});
	});
}

function onJoin(client) {
	client.on('join', function(channel, nick, message) {//TODO use room.pending and send diff event for each room.	
		addUsers(client, channel, nick);
	});
}

/**
 *List of names send by server for channel
 */
function onNames(client) {
	client.on('names', function(channel, nicks) {
		console.log("server names", nicks);
		for (var nick in nicks) {
			if (nicks.hasOwnProperty(nick)) {
				if (client.nick === nick) continue;//my 
				//servChanProp[client.opt.server][channel].rooms.forEach(function(room) {
					addUsers(client, channel, nick);
				//});
			}		
		}
	});
}
/****************************************** add online irc users ***************/

/************************* send users msg ***************************************/
//text and action message
function say(message) {
	var client = clients[message.from][rooms[message.to].params.irc.server];
	client.say(rooms[message.to].params.irc.channel, message.text);
}
/************************* send users msg ***************************************/

/**
 * changes mapping of old nick to new nick
 * called from other side of app.
 * and not reconnect as new user.
 * this will be reply of back message.
 */
function newNick(room, nick, sbNick) {//TODO just send room.id
	if (!servNick[room.params.irc.server]) {
		servNick[room.param.irc.server] = {};
	}
	servNick[room.params.irc.server][nick] = {nick: sbNick, dir: "in"};
}

/**
 *@param oldNick old actual nick
 *@param{string} newNick try to rename to new nick of generate suggestion based on new nick. 
 *callback(nick) with assiged new nick
 //TODO use this to update new schema.
 */
function rename(room, oldNick, newNick, cb) {
	var client = clients[oldNick][server];
	client.rename(newNick);
	delete clients[oldNick][server];
	if (!clients[newNick]) clients[newNick] = {};
	client.nick = newNick;
	clients[newNick][server] = client;
	nicks[oldNick] = cb;	
}


/************************************ update servChanNick *************************/

function onRaw(client) {
	client.on('raw', function(raw) {
		core.emit('data', {
			type: 'raw',
			server: client.opt.server,
			data: raw
		});
	});
}

function onError(client) {
	client.on('error', function(message) {
		core.emit('data', {
			type: 'ircError',
			server: client.opt.server,
			message: message
		});
	});
}

function onPartUser(client) {
	client.on('part', function() {
		if (client.opt.channels.length === 0) {
			client.disconnect();
			delete clients[client.nick][client.opt.server];
		}
	});
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
	var client = clients[botNick][server];
	client.whois(nick, callback);
}






