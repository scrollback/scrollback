var gen = require("../lib/generate.js");
var guid = gen.uid;
var config = require('../config.js');
var log = require("../lib/logger.js");
var events = require('events');
var clientEmitter = new events.EventEmitter();
var client = require('./client.js')(clientEmitter);
var core;
var callbacks = {};
var onlineUsers = {};
var userExp = 1000*15;

module.exports = function (coreObj) {
	core = coreObj;
	init();
	core.on ('room', function(room, callback) {
		if (room.type === 'room' && !room.old && room.params.irc) {//TODO chack if new irc config.
			room.params.irc.channel = room.params.irc.channel.toLowerCase();
			addNewBot(room, callback);
		} if (room) {//room config changed
			//code
		} else callback();
		
	}, "gateway");
	core.on('text', function(text, callback) {
		var type = text.type;
		if (text.room.params && text.params.irc) {
			switch (type) {
				case 'text':
					say(text.to, text.from, text.text);
					break;
				case 'back':
					if (onlineUsers[text.to] && onlineUsers[text.to][text.from]) {
						delete onlineUsers[text.to][text.from];
					} else {
						connectUser(text.from, text.to);
					}
					break;
				case 'away':
					disconnectUser(text.to, text.from);
					break;
				case 'init':
					
					break;
			}	
		}
		callback(text);
	}, "gateway");
};
function init() {
	core.emit("getRooms", {identity: "irc"}, function(data) {
		var rooms = data.results;
		var uid = guid();
		clientEmitter.emit("write", {
			type: "getCurrentState",
			uid: uid
		});
		callbacks[uid] = function(state){
			rooms.forEach(function(room) {
				if (state.rooms[room.id]) {
					var r = state.rooms[room.id];
					if (!(r.id === room.id && room.params.irc.server == r.params.irc.server &&
						room.params.irc.channel && room.params.irc.pending === r.params.irc.pending &&
						room.params.irc.enabled === r.params.irc.enabled)) {
							partBot(r);
							addNewBot(room);
						//TODO remove other rooms bots.
					} 
				} else {
					addNewBot(room);
				}
				//send init and back for incoming users with irc sessionIDs
				var servChanProp = state.servChanProp;
				var servNick = state.servNick;
				if (servChanProp[room.params.irc.server] &&
					servChanProp[room.params.irc.server][room.params.irc.channel]) {
					var users = servChanProp[room.params.irc.server][room.params.irc.channel].users;
					users.forEach(function(user) {
						if(servNick[room.params.irc.server] &&
							servNick[room.params.irc.server][user].dir == "in") {
							sendInitAndBack(user, "irc//" + room.params.irc.server + ":" + user, room);
						} else if(servNick[room.params.irc.server] && servNick[room.params.irc.server].dir === "out") {
							onlineUsers[room.id][servNick[room.params.irc.server].nick] = user;
							setTimeout(function() {
								if(	onlineUsers[room.id][servNick[room.params.irc.server].nick]) {
									log("disconnecting user ", servNick[room.params.irc.server].nick, " from ", room.id);
									disconnectUser(room.id, servNick[room.params.irc.server].nick);
								}
							}, userExp);				
						}
					});
				}
				
			});
			
			
			
			//TODO populate list of online outgoing users.
			
			
			
			log("rooms", rooms);	
		};
	
	});
	

	clientEmitter.on('callback', function(data) {
		console.log("callback =", data);//each callback have 1 parameter as input.
		if(data.uid && callbacks[data.uid]) {
			console.log("callbacks calling..");
			callbacks[data.uid](data.data);//other information of callback should be inside data.
		}
	});
	
	
	clientEmitter.on('room', function(room) {
		log("room event:", room);
		room.room.session = "internal:irc//" + room.params.irc.server;
		core.emit("room", room.room);
		connectAllUsers(room.room);		
		//TODO check if room pending is true get all online users of that room and connect.
	});
	clientEmitter.on("back", function(data) {
		console.log("back", data);
		sendInitAndBack(data.from, data.session, data.room);
		
	});
	
	clientEmitter.on("away", function(data) {
		core.emit('text', {
			guid: guid(),
			type: 'away',
			from: data.from,
			to: data.to
		});
	});
	
}

function sendInitAndBack(suggestedNick, session ,room) {
	log("values: ", suggestedNick, session, room);
	core.emit('init', {
			suggestedNick: suggestedNick,
			session: session,
			to: "me"
		}, function(init) {
			log("init back", init);
			//if (init.user.id !== suggestedNick) 
			clientEmitter.emit('write', {
				type: "newNick",//change mapping only.
				nick: suggestedNick,//from,
				sbNick: init.user.id ,//init.from,
				roomId: room.id
			});
			//gen back messages.
			core.emit('text', {
					id: guid(),
					type: 'back',
					to: room.id,
					from: init.user.id//nick returned from init.
				}, function(text) {
			});
	});
}


function connectAllUsers(room) {
	core.emit('getUsers', {occupantOf: room.id}, function(data) {
		data.forEach(function(user) {
			connectUser(room, user.id);//TODO use proper format of user object
		});
	});
}

function connectUser(roomId, user) {
	var uid = guid();
	console.log("connecting user:", user, uid);
	clientEmitter.emit('write', {
		uid: uid,
		type: "connectUser",
		roomId: roomId,
		nick: user,
		options: {}
	});
}


function say(roomId, from, text) {
	clientEmitter.emit('write', {
		type: 'say',
		message: {
			to: roomId,
			from: from,
			text: text
		}
	});
}

function disconnectBot(roomId) {
	var uid = guid();
	clientEmitter.emit('write', {
		uid: uid,
		type: 'partBot',
		room: roomId
	});
}

function disconnectUser(roomId, user) {
	var uid = guid();
	clientEmitter.emit('write', {
		uid: uid,
		type: 'partUser',
		room: roomId,
		nick: user
	});
}


/*new Request.*/
function addNewBot(r, callback) {
	var room  = copyRoomOnlyIrc(r);
	if(callback) {
		room.params.irc.enabled = true;
		room.params.irc.pending = true;
	}
	var uid = guid();
	clientEmitter.emit('write', {
		uid: uid,
		type: 'connectBot',
		room: room,
		options: {}
	});
	if (callback) {
		callbacks[uid] = function(message) {
			room.params.irc.message = message;
			if(message) callback(room);
		};
	}
}
/**
 * Copy only roomId and IRC params.
 */
function copyRoomOnlyIrc(room) {
	return {id: room.id, params: {irc: room.params.irc}};
}