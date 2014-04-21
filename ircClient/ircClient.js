var net = require('net');
var irc = require('irc');
var core;
var botNick = "scrollback" ;//part of config of IRC client.
var clients = {};//for server channel user,server --> client. 
var servChanProp = {};//object of server channel prop
var rooms = {};//room id to room obj map. //TODO delete room obj if any room deleted irc.(Done Test)
var servNick = {};//server channel nick -------> sb nick.
var renameCallback = {};
module.exports.connectBot = connectBot;
module.exports.connectUser = connectUser;
module.exports.say = say;
module.exports.rename = rename;
module.exports.newNick = newNick;
module.exports.partUser = partUser;
module.exports.getCurrentState = getCurrentState;
module.exports.partBot = partBot;
module.exports.getBotNick = getBotNick;
module.exports.init = function init(coreObj) {
	core = coreObj;
};

/******************************************
TODO's 
rename IRC user.
handle this error.
ERROR: { prefix: 'irc.local',
  server: 'irc.local',
  command: 'err_erroneusnickname',
  rawCommand: '432',
  commandType: 'error',
  args: 
   [ 'test2',
     'long name' ] }
//9 char is min max limit if(nick > 9) gen random.

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
			//showErrors: true,
			webircPassword: options.webircPassword,
			userIp : options.userIp,
			userHostName: options.userHostName
		});
	//console.log("client=", client);
	clients[nick][server] = client;
	client.conn.on("connect", cb);
	onError(client);
	return client;
}

/**
 *always actual nick will be used for identify a user
 *opt.identId is used for ident.
 *TODO handle bot nick change case.
 */
function connectBot(room, options, cb) {
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
	if (servChanProp[server][channel].rooms.length !== 0) {
		cb("already connected to some other room");
		return;
	}
	//TODO if already connected to some room then callback with error.
	servChanProp[server][channel].rooms.push(room);
	var ch = room.params.irc.pending ? [] : [channel];//after varification connect to channel
	if (!servNick[server]) servNick[server] = {};
	var client;
	if (!clients[botNick]) clients[botNick] = {}; 
	if (clients[botNick][server]) {//already connected to server.
		joinChannels(server, botNick, ch, cb);
	} else {
		client = joinServer(server, botNick, ch, options, cb);
		onPM(client);
		//onRaw(client);
		onMessage(client);
		onNames(client);
		onJoin(client);
		onNick(client);
		onRegistered(client);
		onLeave(client);
	}
}

function partBot(roomId) {
	//TODO disconnect all users from this room also
	var room  = rooms[roomId];
	var client = clients[botNick][room.params.irc.server];
	var channel = room.params.irc.channel;
	var server = room.params.irc.server;
	client.part(channel);//disconnect bot in case of all part.
	var users = servChanProp[room.params.irc.server][channel].users;
	console.log("users", users, ", servNick", servNick);
	users.forEach(function(user) {
		if(servNick[server][user].dir === 'out') {
			var sbNick = servNick[server][user].nick;
			clients[sbNick][server].part(channel);
		}
	});
	delete rooms[roomId];//how to delete servChanProp[serv][chan]
}

function connectUser(roomId, nick, options, cb) {
	console.log("room=", room);
	var room = rooms[roomId];
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
			if(!servNick[client.opt.server]) servNick[client.opt.server] = {};	
			servNick[client.opt.server][client.nick] = {nick: client.sbNick, dir: "out"};
		});
		client.on('part', function(channel, nk, reason, message) {
			if (client.opt.channels.length === 0) {
				console.log("part channel", nick);
				client.disconnect();
				delete clients[nick][client.opt.server];//TODO some cleanup needed?	
			}
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
		servChanProp[client.opt.server][from].rooms.forEach(function(room) {
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
					text: message
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
						console.log("room pending true");
						reply.channels.forEach(function(channel) {
							if (channel.substring(0,1) == '@' && channel.substring(1) === room.params.irc.channel) {
								room.params.irc.pending = false;
								client.join(room.params.irc.channel);
								core.emit('data', {type: "room", room: room});
							}
						});
					}
				});
			});
		}
	});
}


/************************** user left *****************************************/
/**
 * When client leave the server or channel.
 * @param {Object} client client object
 */
function onLeave(client) {

	client.on("part", function(channel, nick, reason, message){//TODO delete client if no more connections
		left(client, [channel], nick);
	});	
	
	client.addListener('kill', function (nick, reason, channels, message)  {//TODO see if autoconnect after kill
		left(client, channels, nick);
	});

	client.addListener('quit', function (nick, reason, channels, message)  {
		left(client, channels, nick);
	});

	client.addListener('kick', function (channel, nick, by, reason, message)  {
		if(!(servNick[client.opt.server][nick] && servNick[client.opt.server][nick].dir === 'out')) {
			left(client, [channel], nick);
		}
	});
}

function left(client, channels, nick) {
	var sbUser = servNick[client.opt.server][nick];
	if (servNick[client.opt.server]) {
		delete servNick[client.opt.server][nick];
	}
	channels.forEach(function(channel) {
		if (client.nick === nick) {//bot left the channel //TODO test
			delete servChanProp[client.opt.server][channel];
			return;
		}
		var index = servChanProp[client.opt.server][channel].users.indexOf(nick);
		if(index > -1) servChanProp[client.opt.server][channel].users.splice(index, 1);
		servChanProp[client.opt.server][channel].rooms.forEach(function(room) {
			if(!room.params.pending && sbUser && sbUser.dir === "in") {//send away message for only incoming users
				core.emit("data", {
					type: "away",
					to: room.id,
					from: sbUser.nick,
					room: room
				});
			}
		});
		
	});
}
/************************** user left *****************************************/

/****************************************** add online irc users ***************/
/**
 * add new member 
 */
function addUsers(client, channel, nick) {
	servChanProp[client.opt.server][channel].rooms.forEach(function(room) {
		//save data.
		if(nick != client.nick) servChanProp[client.opt.server][channel].users.push(nick);//don't add myNick 
		if(nick != client.nick && !servNick[client.opt.server][nick] &&
			!room.params.irc.pending) {
			servNick[client.opt.server][nick] = {nick: nick, dir: "in"};//default nick is irc nick
			core.emit("data", {
				type: "back",
				to: room.id,
				from: nick,
				room: room,
				session: "ircClient//:"+client.opt.server + ":" + nick
			});
		}
	});
}

function onNick(client) {
	client.addListener('nick', function (oldNick, newNick, channels, message)  {
		if (!(renameCallback[oldNick] && renameCallback[oldNick][client.opt.server])) {
			channels.forEach(function(channel) {
				addUsers(client, channel, newNick);
			});
		} else {
			channels.forEach(function(channel) {
				servNick[client.opt.server][newNick] = {nick: renameCallback.newNick, dir: "out"};
				delete servNick[client.opt.server][oldNick];
				delete renameCallback[oldNick][client.opt.server];
			});
		}
		left(client, channels, oldNick);	
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
				addUsers(client, channel, nick);
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
 * this will be reply of back message if nick changes.
 */
function newNick(roomId, nick, sbNick) {
	var room = rooms[roomId];
	if (!servNick[room.params.irc.server]) {
		servNick[room.param.irc.server] = {};
	}
	servNick[room.params.irc.server][nick] = {nick: sbNick, dir: "in"};
}

/**
 * change nick in every server for that user.
 * @param {Object} oldNick old nick
 * @param {Object} newNick new Nick
 */
function rename(oldNick, newNick) {
	for(var server in clients[oldNick]) {//
		if (clients[oldNick].hasOwnProperty(server)) {
			var client = clients[oldNick][server];
			if(!renameCallback[client.nick]) renameCallback[client.nick] = {}; 
			renameCallback[client.nick][server] = {oldNick: oldNick, newNick: newNick};			
			client.rename(newNick);
			if (!clients[newNick]) clients[newNick] = {};
			clients[newNick][server] = clients[oldNick][server];
		}
	}
	delete clients[oldNick];
}

/**
 * away message from user
 * @param roomId ID of room.
 * @param {nick} nick user's unique nick
 */
function partUser(roomId, nick) {
	console.log("rooms", rooms, "roomId:", roomId, " nick", nick);
	var room = rooms[roomId];
	console.log(room);
	var client = clients[nick][room.params.irc.server];
	client.part(room.params.irc.channel);
}


/************************************ update servChanNick *************************/

/**
 * Return current state of Client.
 * @param {function} callback callback(state)
 */
function getCurrentState() {
	return {//state
		rooms: rooms,
		servChanProp: servChanProp,
		servNick: servNick
	};
}

/**
 * get Current nick of bot on server
 * @param {string} roomId 
 * @param {function} callback callback(nick)
 */
function getBotNick(roomId, callback) {
	var room = rooms[roomId];
	var nick = clients[botNick][room.params.irc.server].nick;
	callback(nick);
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

function onError(client) {
	client.on('error', function(message) {
		core.emit('data', {
			type: 'ircError',
			server: client.opt.server,
			message: message
		});
	});
}