var irc = require('irc');
irc.startIdentServer();
var queue = require("./queue.js");
var log = require('../lib/logger.js');
var config = require('./config.js');
var core;
var botNick = config.botNick; //part of config of IRC client.
var clients = {}; //for server channel user,server --> client.
var servChanProp = {}; //object of server channel prop (room, user)
var rooms = {}; //room id to room obj map.
var servNick = {}; //server channel nick -> sb nick.
var renameCallback = {};
var partBotCallback = {};
var connected = false;
var servChanCount = {};
/******************************* Exports ****************************************/
module.exports.say = say;
module.exports.rename = rename;
module.exports.partBot = partBot;
module.exports.newNick = newNick;
module.exports.partUser = partUser;
module.exports.connectBot = connectBot;
module.exports.connectUser = connectUser;
module.exports.getBotNick = getBotNick;
module.exports.isConnected = isConnected;
module.exports.setConnected = setConnected;
module.exports.sendQueueData = sendQueueData;
module.exports.getCurrentState = getCurrentState;
module.exports.isUserConnected = isUserConnected;
module.exports.disconnectUser = disconnectUser;
module.exports.init = function init(coreObj) {
	core = coreObj;
};
/*********************************** Exports ****************************************/
/**
 *Server already connected.
 */
function joinChannels(server, nick, channels, cb) {
	var client = clients[nick][server];
	channels.forEach(function (channel) {
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
	var displayNick = nick.indexOf('guest-') === 0 ? nick.substring(6) : nick;
	var webIrcPassword = config.webirc[server];
	log("password=", webIrcPassword);
	var client = new irc.Client(server, displayNick, {
		userName: displayNick,
		realName: nick + '@scrollback.io',
		channels: channels,
		debug: config.debug,
		autoRejoin: options.autoRejoin,
		stripColors: true,
		floodProtection: true,
		identId: options.identId,
		//showErrors: true,
		webircPassword: webIrcPassword,
		userIp: options.userIp,
		userHostName: options.userHostName
	});
	clients[nick][server] = client;
	client.conn.on("connect", cb);
	onError(client);
	onPrivateMessage(client);
	return client;
}
/**
 *always actual nick will be used for identify a user
 *opt.identId is used for ident.
 */
function connectBot(room, options, cb) {
	options.userIp = config.myIP; // send it as webIRC header.
	options.userHostName = config.host;
	console.log("Connect Bot ", room, options);
	options.autoRejoin = false;
    var server = room.params.irc.server;
	var channel = room.params.irc.channel.toLowerCase();
	if (!servChanProp[server]) servChanProp[server] = {};
	if (servChanProp[server][channel] && servChanProp[server][channel].room) {
		cb("ERR_CONNECTED_OTHER_ROOM");
		return;
	}
	if (!servChanCount[server]) servChanCount[server] = 1;
	else servChanCount[server]++;
	rooms[room.id] = room;
	servChanProp[server][channel] = {};
	servChanProp[server][channel].users = [];
	rooms[room.id] = room;
	servChanProp[server][channel].room = room;

	var ch = room.params.irc.pending ? [] : [channel]; //after varification connect to channel
	if (!servNick[server]) servNick[server] = {};
	var client;
	if (!clients[botNick]) clients[botNick] = {};
	if (clients[botNick][server]) { //already connected to server.
		joinChannels(server, botNick, ch, cb);
	} else {
		client = joinServer(server, botNick, ch, options, cb);
		onInvite(client);
		onRaw(client);
		onMessage(client);
		onNames(client);
		onJoin(client);
		onNick(client);
		onLeave(client);
	}
}

function partBot(roomId, callback) {

	var room = rooms[roomId];
	log("****part bot for room ", roomId, room);
	if (!room) return callback(); //should throw an error? not sure...
	var client = clients[botNick][room.params.irc.server];
	if (!client) return callback();
	var channel = room.params.irc.channel;
	var server = room.params.irc.server;
	var pending = room.params.irc.pending;
	if (pending) {
		servChanCount[server]--;
		if (servChanCount[server] === 0) {
			client.disconnect();
			delete clients[botNick][server];
		}
		delete room[roomId];
		delete servChanProp[server][channel];
		return callback();
	}
	var users = servChanProp[server] && servChanProp[server][channel] && servChanProp[room.params.irc.server][channel].users;
	if (users) users.forEach(function (user) {
		if (servNick[server][user].dir === 'out') {
			var sbNick = servNick[server][user].nick;
			clients[sbNick][server].part(channel);
		} else {
			core.emit("data", {
				type: "away",
				to: room.id,
				from: servNick[server][user].nick,
				room: room,
				session: "irc://" + server + ":" + user
			});
		}
	});
	partBotCallback[roomId] = callback;
	return client.part(channel); //disconnect bot in case of all part.

}

function connectUser(roomId, nick, options, cb) {
	options.autoRejoin = true;
    var room = rooms[roomId];
	log("room=", room);
	var server = room.params.irc.server;
	var channel = room.params.irc.channel;
	var client;
	function userLeft(channel, nick) {
		log("connect bot", arguments);
		channel = channel.toLowerCase();
		log("got user left", arguments, client.nick, client.channels);
		if ( client.nick === nick) {
			client.channels.splice(client.channels.indexOf(channel), 1);
		}
		if (client.channels.length === 0) {
			log("part channel", nick, arguments);
			client.disconnect();
			log("disconnecting user", client.nick);
			delete clients[client.sbNick][client.opt.server];
		}
	}
	if (!clients[nick]) clients[nick] = {};
	if (clients[nick][server]) {
		client = joinChannels(server, nick, [channel], cb);
	} else {
		log("connecting user", nick);
		client = joinServer(server, nick, [channel], options, cb);
		client.channels = [];
        client.sbNick = nick;
		client.once('registered', function () {
			if (!servNick[client.opt.server]) servNick[client.opt.server] = {};
			servNick[client.opt.server][client.nick] = {
				nick: client.sbNick,
				dir: "out"
			};
		});

        client.on("part", function (channel, nick) {
            log("connect bot", arguments);
            userLeft(channel, nick);
        });
        client.addListener('quit', function (nick, reason, channels) {
            log("connect bot", arguments);
            channels.forEach(function(channel) {
                userLeft(channel, nick);
            });
        });
		client.on('join', function (channel, nk) {
            log("connect bot Join: " , arguments);
            if ( client.nick === nk) {
                client.channels.push(channel);
            }
		});
	}
}

function onMessage(client) {
	function msg(nick, to, text) {
		to = to.toLowerCase();
		if (!servChanProp[client.opt.server][to]) {
			return;
		}
		var time = new Date().getTime();
		if (connected) {
			sendMessage(client.opt.server, nick, to, text, time);
		} else {
			queue.push({
				fn: "sendMessage",
				server: client.opt.server,
				to: to,
				from: nick,
				time: time,
				text: text
			});
		}
	}
	client.on('message#', function (nick, to, text) {
		log("on message" /*, JSON.stringify(servNick)*/ );
		msg(nick, to, text);
	});
	client.on("action", function (nick, channel, text) {
		msg(nick, channel, "/me " + text);
	});
}

function sendMessage(server, from, to, text, time) {
	to = to.toLowerCase();
	log("on message :", server, from, to, text);
	var room = servChanProp[server][to].room;
	if (!room.pending) {
		var f;
		if (servNick[server] && servNick[server][from] && servNick[server][from].dir === 'in') {
			f = servNick[server][from].nick;
		} else return;
		core.emit('data', {
			type: 'message',
			to: room.id,
			from: f,
			text: text,
			time: time,
			session: "irc://" + server + ":" + from
		});
	}
}

function onInvite(client) {
	client.on('invite', function (channel) {
		channel = channel.toLowerCase();
		var server = client.opt.server;
		if (servChanProp[server][channel]) {
			var room = servChanProp[server][channel].room;
			if (room && room.params.irc.pending) {
				client.join(channel);
				if (connected) {
					sendRoom(room, false);
				} else {
					queue.push({
						fn: "sendRoom",
						room: room,
						pending: false
					});
				}
			}
		}
	});
}

function sendRoom(room, pending) {
	room.params.irc.pending = pending;
	core.emit('data', {
		type: "room",
		room: room
	});
}

/************************** user left *****************************************/
/**
 * When client leave the server or channel.
 * @param {Object} client client object
 */
function onLeave(client) {

	client.on("part", function (channel, nick) {
		left(client, [channel], nick);
	});

	client.addListener('kill', function (nick, reason, channels) {
		if (client.nick === nick) {//scrollback bot
			log.e("bot got killed on server: " + client.opt.server, JSON.stringify(arguments));
		} else left(client, channels, nick);
	});

	client.addListener('quit', function (nick, reason, channels) {
		left(client, channels, nick);
	});

	client.addListener('kick', function (channel, nick, by, reason) {
		log("Kick: ", arguments);
		var server = client.opt.server;
		if (nick === client.nick) {
			var room = servChanProp[server][channel].room;
			if (!room) return;
			log.e("Bot " + nick + " is kicked from channel " + channel + " by " + by + " because of " + reason + " room: " + room.id);
			var users = servChanProp[server] && servChanProp[server][channel] && servChanProp[room.params.irc.server][channel].users;
			if (users) users.forEach(function (user) {
				if (servNick[server][user].dir === 'out') {
					var sbNick = servNick[server][user].nick;
					clients[sbNick][server].part(channel);
				} else {
					core.emit("data", {
						type: "away",
						to: room.id,
						from: servNick[server][user].nick,
						room: room,
						session: "irc://" + server + ":" + user
					});
				}
			});
			if (room) {
				room.params.irc.pending = true;
			}
			if (connected) {
				sendRoom(room, true);
			} else {
				queue.push({
					fn: "sendRoom",
					room: room,
					pending: true
				});
			}
			return;
		}
		if (!(servNick[server][nick] && servNick[server][nick].dir === 'out')) {
			left(client, [channel], nick);
		}
	});
}

function left(client, channels, nick) {
	if (connected) {
		sendAway(client.opt.server, channels, nick, client.nick);
	} else {
		queue.push({
			fn: "sendAway",
			server: client.opt.server,
			channels: channels,
			nick: nick,
			bn: client.nick
		});
	}
	if (client.nick === nick) { //My nick leaving the channel
		servChanCount[client.opt.server] -= channels.length;
		if (servChanCount[client.opt.server] === 0) {
			client.disconnect();
			delete clients[botNick][client.opt.server];
		}
	}
}

function sendAway(server, channels, nick, bn) {
	var sbUser = servNick[server][nick];
	console.log("send away****", channels, nick, bn);
	channels.forEach(function (channel) {
		channel = channel.toLowerCase();
		if (bn === nick) { //bot left the channel
			var roomId = servChanProp[server][channel].room.id;
			console.log("deleting data:****", roomId);
			delete servChanProp[server][channel];
			delete rooms[roomId];
			partBotCallback[roomId]();
			delete partBotCallback[roomId];
			return;
		}
		if (!servChanProp[server][channel]) {
			return;
		}
		var index = servChanProp[server][channel].users.indexOf(nick);
		if (index > -1) servChanProp[server][channel].users.splice(index, 1);
		var room = servChanProp[server][channel].room;
		if (!room.params.pending && sbUser && sbUser.dir === "in") { //send away message for only incoming users
			core.emit("data", {
				type: "away",
				to: room.id,
				from: sbUser.nick,
				room: room,
				session: "irc://" + server + ":" + nick
			});
		}
	});
	for (var channel in servChanProp[server]) { //if user left from all channel
		if (servChanProp[server].hasOwnProperty(channel)) {
			if (servChanProp[server][channel].users.indexOf(nick) != -1) {
				return;
			}
		}
	}
	log("user:", nick, "went away from all channel in ", server, "server");
	delete servNick[server][nick];
}

/************************** user left *****************************************/

/****************************************** add online irc users ***************/
/**
 * add new member
 */
function addUsers(client, channel, nick) {
	channel = channel.toLowerCase();
	if (connected) {
		sendBack(client.opt.server, channel, nick, client.nick);
	} else {
		queue.push({
			fn: "sendBack",
			server: client.opt.server,
			channel: channel,
			nick: nick,
			bn: client.nick
		});
	}
}

function sendBack(server, channel, nick, bn) {
	log("server: ", server, " channel:", channel, "nick: ", nick);
	channel = channel.toLowerCase();
	if (!servChanProp[server] || !servChanProp[server][channel]) {
		console.log("This should not happen");
		return;
	}
	var room = servChanProp[server][channel].room;

	//save data.
	if (nick != bn) servChanProp[server][channel].users.push(nick); //don't add myNick
	if (nick != bn && (!servNick[server][nick] || (servNick[server][nick].dir == "in")) && !room.params.irc.pending) {
		servNick[server][nick] = {
			nick: nick,
			dir: "in"
		}; //default nick is irc nick
		core.emit("data", {
			type: "back",
			to: room.id,
			from: nick,
			room: room,
			session: "irc://" + server + ":" + nick
		});
	}
}

function onNick(client) {
	client.addListener('nick', function (oldNick, newNick, channels, message)  {
		log("Nick event", oldNick, newNick, channels, message);
		if (servNick[client.opt.server][oldNick] && servNick[client.opt.server][oldNick].dir === "out") {
			servNick[client.opt.server][newNick] = {nick: servNick[client.opt.server][oldNick].nick, dir: "out"};
			channels.forEach(function(channel) {
				var index = servChanProp[client.opt.server][channel].users.indexOf(oldNick);
				if (index > -1) servChanProp[client.opt.server][channel].users.splice(index, 1);
				servChanProp[client.opt.server][channel].users.push(newNick);
			});
			delete servNick[client.opt.server][oldNick];
			return;
		}

		if (!(renameCallback[oldNick] && renameCallback[oldNick][client.opt.server])) {
			channels.forEach(function (channel) {
				addUsers(client, channel, newNick);
			});
		} else {
			channels.forEach(function () {
				servNick[client.opt.server][newNick] = {
					nick: renameCallback.newNick,
					dir: "out"
				}; //this is for user which is connecting from scrollback(NO need to queue updation.)
				delete servNick[client.opt.server][oldNick];
				delete renameCallback[oldNick][client.opt.server];
			});
		}
		left(client, channels, oldNick);
	});
}

function onJoin(client) {
	client.on('join', function (channel, nick) {
		addUsers(client, channel, nick);
	});
}

/**
 *List of names send by server for channel
 */
function onNames(client) {
	client.on('names', function (channel, nicks) {
		log("server names", nicks);
		for (var nick in nicks) {
			if (nicks.hasOwnProperty(nick)) {
				if (client.nick === nick) continue; //my
				addUsers(client, channel, nick);
			}
		}
	});
}
/****************************************** add online irc users ***************/

/************************* send users msg ***************************************/
//text and action message
function say(message) {
	log("message sending to irc:", message);
	var client = clients[message.from][rooms[message.to].params.irc.server];
	if (message.text.indexOf("/me ") !== 0) client.say(rooms[message.to].params.irc.channel, message.text);
	else client.action(rooms[message.to].params.irc.channel, message.text.substring(4));
}
/************************* send users msg ***************************************/

/**
 * changes mapping of old nick to new nick
 * and not reconnect as new user.
 * this will be reply of back message if nick changes.
 */
function newNick(roomId, nick, sbNick) {
	log("rooms:", roomId);
	var room = rooms[roomId];
	if (!room) return;
	if (!servNick[room.params.irc.server]) {
		servNick[room.param.irc.server] = {};
	}
	servNick[room.params.irc.server][nick] = {
		nick: sbNick,
		dir: "in"
	};
}

/**
 * change nick in every server for that user.
 * @param {Object} oldNick old nick
 * @param {Object} newNick new Nick
 */
function rename(oldNick, newNick) {
	for (var server in clients[oldNick]) { //
		if (clients[oldNick].hasOwnProperty(server)) {
			var client = clients[oldNick][server];
			if (!renameCallback[client.nick]) renameCallback[client.nick] = {};
			renameCallback[client.nick][server] = {
				oldNick: oldNick,
				newNick: newNick
			};
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
	log("rooms", rooms, "roomId:", roomId, " nick", nick);
	var room = rooms[roomId];
	var client = clients[nick][room.params.irc.server];
	client.part(room.params.irc.channel);
}

function disconnectUser(nick) { //TODO delete users from state object.
	for (var key in clients[nick]) {
		if (clients[nick].hasOwnProperty(key)) {
			clients[nick][key].disconnect();
		}
	}
}

/**
 * Return current state of Client.
 */
function getCurrentState() {
	return { //state
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
function getBotNick(roomId) {
	var room = rooms[roomId];
	var nick = "NO_ROOM";
	if (room && clients[botNick][room.params.irc.server]) {
		nick = clients[botNick][room.params.irc.server].nick;
	}
	return nick;
}

function isConnected() {
	return connected;
}

function setConnected(c) {
	connected = c;
}

function isUserConnected(sbNick) {
	return clients[sbNick] ? true : false;
}

function sendQueueData() {
	log("Sending queue data:");
	while (true) {
		var obj = queue.pop();
		if (obj === null) break;
		switch (obj.fn) {
		case "sendBack":
			sendBack(obj.server, obj.channel, obj.nick, obj.bn);
			break;
		case "sendAway":
			sendAway(obj.server, obj.channels, obj.nick, obj.bn);
			break;
		case "sendMessage":
			sendMessage(obj.server, obj.from, obj.to, obj.text, obj.time);
			break;
		case "sendRoom":
			sendRoom(obj.room, obj.pending);
			break;
		}
	}

}

function onRaw(client) {
	client.on('raw', function (raw) {
		log("Raw message:", raw);
	});
}

function onError(client) {
	client.on('error', function (message) {
		log("IRC error:", message);
		core.emit('data', {
			type: 'ircError',
			server: client.opt.server,
			message: message
		});
	});
}

function onPrivateMessage(client) {
	client.on("pm", function(nick, text, message) {
		log("Private Message: ", nick, text, message);
		client.say(nick, "Hey " + nick + ", I am using a web client that doesn't support PMs. Try reaching me on the channel.");
	});
}
