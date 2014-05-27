var gen = require("../lib/generate.js");
var guid = gen.uid;
var config = require('../config.js');
var log = require("../lib/logger.js");
var events = require('events');
var clientEmitter = new events.EventEmitter();
var client = require('./client.js');
var internalSession = Object.keys(config.whitelists)[0];
client.init(clientEmitter);
var core;
var callbacks = {};
var onlineUsers = {};
var firstMessage = {};//[room][username] = true
var userExp = 10*60*1000;
var initCount = 0;
module.exports = function (coreObj) {
	core = coreObj;
	core.on("http/init", function(payload, callback) {
		payload.irc = {
			get: function(req,res,next) {	
				getRequest(req,res,next);
			}
		};
		callback(null, payload);
	}, "setters");
	init();
	core.on ('room', function(room, callback) {
		log("room irc:", room, client.connected(), room.session.indexOf('internal') !== 0);
		if (room.type !== "room" || room.session === internalSession) return callback();
		if (room.room.params && room.room.params.irc && client.connected()) {
			room = changeRoomParams(room);
			var rr = room.room;
			log("room irc after adding additional properties:", room.room.params.irc);
			if ((!room.old || !room.old.id) && rr.params.irc && rr.params.irc.server && rr.params.irc.channel) {//TODO chack if new irc config.
				rr.params.irc.channel = rr.params.irc.channel.toLowerCase();
				return addNewBot(rr, callback);
			} else if (room.old && room.old.id) {//room config changed
				var oldIrc = room.old.params.irc;
				var newIrc = rr.params.irc;
				if (oldIrc.server !== newIrc.server || oldIrc.channel !== newIrc.channel ||
					oldIrc.enable !== newIrc.enable || oldIrc.pending !== newIrc.pending) {
					if(oldIrc.server && oldIrc.channel &&
						oldIrc.server.length > 0 && oldIrc.channel.length > 0) disconnectBot(rr.id);
					return addNewBot(rr, callback);
				} else return callback();
			} else return callback(); 
		} else return callback();
	}, "gateway");
	
	
	core.on("init", function(init, callback) {
		log("init irc:", init);
		var oldUser = {id: init.from};
		var newUser = init.user;
		
		if (oldUser && newUser && oldUser.id != newUser.id) {
			var uid = guid();
			clientEmitter.emit("write", {
				type: "isUserConnected",
				sbNick: oldUser.id,
				uid: uid
			});
			callbacks[uid] = function(isConn) {
				if (isConn) {
					uid = guid();
					clientEmitter.emit("write", {
						type: "isUserConnected",
						sbNick: newUser.id,
						uid: uid
					});
					clientEmitter.emit('write', {
						type: "disconnectUser",
						sbNick: oldUser.id
					});	
				}
			};
			
		}
		callback();
	}, "gateway");
	
	core.on('text', function(text, callback) {
		log("On text:", client.connected());
		log("text called irc:", text);
		log("online users:", onlineUsers);
		if (text.room.params && text.room.params.irc && text.session.indexOf('irc') !== 0 && client.connected()) {//session of incoming users from irc 
			if(!(firstMessage[text.to] && firstMessage[text.to][text.from])) {
				if (!firstMessage[text.to]) {
					firstMessage[text.to] = {};
				}
				firstMessage[text.to][text.from] = true;
				if (onlineUsers[text.to] && onlineUsers[text.to][text.from]) {
					delete onlineUsers[text.to][text.from];
				} else connectUser(text.to, text.from);
			}
			say(text.to, text.from, text.text);
		}
		callback();
	}, "gateway");
	
	core.on('away', function(action, callback) {
		log("On away:", client.connected());
		if (action.room.params && action.room.params.irc && action.session.indexOf('irc') !== 0 && client.connected()) {//session of incoming users from irc 
			if(firstMessage[action.to] && firstMessage[action.to][action.from]) {
				disconnectUser(action.to, action.from);
				delete firstMessage[action.to][action.from];
			}
		}
		callback();
	}, "gateway");	
};

function ircParamsValidation(room) {
	return true;
}




function changeRoomParams(room) {
	room.room.params.irc.enable = true;
	if (!room.room.params.irc.pending) {
		room.room.params.irc.pending = true;
	}
	var or = room.old;
	if (or && or.id && or.params.irc && (or.params.irc.server !== room.room.params.irc.server || or.params.irc.channel !== room.room.params.irc.channel)) {
		room.room.params.irc.pending = true;
	}
	return room;
}

function init() {
	var notUsedRooms = {};
	clientEmitter.on('init', function(st) {
		var state = st.state;
		for(var roomId in state.rooms) {
			if(state.rooms.hasOwnProperty(roomId)) {
				notUsedRooms[roomId] = true;
			}
		}
		log("init from ircClient", state);
		core.emit("getRooms", {identity: "irc", session: internalSession}, function(err, data) {
			var rooms = data.results;
			log("rooms:", rooms);
			log("returned state from IRC:", JSON.stringify(state));
			log("results of getRooms: ", rooms);
			rooms.forEach(function(room) {
				if (state.rooms[room.id]) {
					var r1 = room.params.irc;
					var r2 = state.rooms[room.id].params.irc;
					if (!(r1.server === r2.server && r1.channel === r2.channel && r1.pending === r2.pending)) {
						log("reconnecting bot with new values:", room.id);
						disconnectBot(state.rooms[room.id].id);
						addNewBot(room); 
					}
					delete notUsedRooms[room.id];
				} else {
					log("adding new Bot", room);
					addNewBot(room);
				}
				//send init and back for incoming users with irc sessionIDs
				log("creating online users list");
				var servChanProp = state.servChanProp;
				var servNick = state.servNick;
				
				if (servChanProp[room.params.irc.server] &&
					servChanProp[room.params.irc.server][room.params.irc.channel]) {
					var users = servChanProp[room.params.irc.server][room.params.irc.channel].users;
					users.forEach(function(user) {
						if(servNick[room.params.irc.server] &&
							servNick[room.params.irc.server][user].dir === "in") {
							sendInitAndBack(user, "irc://" + room.params.irc.server + ":" + user, room);
							initCount++;
						}
						if(servNick[room.params.irc.server] &&
								servNick[room.params.irc.server][user].dir === "out") {
							log("room:", room.id, " nick", servNick[room.params.irc.server][user].nick);
							if (!onlineUsers[room.id]) onlineUsers[room.id] = {}; 
							onlineUsers[room.id][servNick[room.params.irc.server][user].nick] = user;
							setTimeout(function() {
								if(	onlineUsers[room.id][servNick[room.params.irc.server][user].nick]) {
									log("disconnecting user ", servNick[room.params.irc.server][user].nick, " from ", room.id);
									disconnectUser(room.id, servNick[room.params.irc.server][user].nick);
									delete onlineUsers[room.id][servNick[room.params.irc.server][user].nick];
								}
							}, userExp);				
						}
					});
				}
				
			});
			for (var ri in notUsedRooms) {
				if (notUsedRooms.hasOwnProperty(ri)) {
					log("disconnecing bot for room ", ri);
					disconnectBot(ri);
				}
			}
		});
		isInitDone();
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
		core.emit("getRooms", {ref: room.room.id, session: internalSession}, function(err, reply) {
			log("results of getRooms", err, reply);
			if (err || !reply.results) return;
			var r = reply.results[0];
			var rr = {type: "room", session: internalSession, room: {}};
			
			r.params.irc = room.room.params.irc;
			rr.room = r;
			rr.to = r.id;
			log("emitting room from irc", rr);
			core.emit("room", rr, function(err, d) {
				log("reply while saving room ", err, d);
			});
			//clear the first msg list
			delete firstMessage[rr.room.id];
		});
	});
	clientEmitter.on("back", function(data) {
		console.log("back", data);
		sendInitAndBack(data.from, data.session, data.room);
	});
	
	clientEmitter.on("away", function(data) {
		core.emit('away', {
			id: guid(),
			type: 'away',
			from: data.from,
			to: data.to,
			session: data.session
		});
	});
	
	clientEmitter.on('message', function(data) {
		log("message from :", data);
		core.emit('text', {
			id: guid(),
			type: 'text',
			to: data.to,
			from: data.from,
			text: data.text,
			time: new Date().getTime(),
			session: data.session
		}, function(err, message) {
			log(err, message);
		});
	});	
}

function  isInitDone() {
	if (initCount === 0) {
		//send back init.
		log("init Done");
		clientEmitter.emit('write', {
			type: 'init'//notify ircClient about comp.
		});
		initCount--;
	}
}

function sendInitAndBack(suggestedNick, session ,room) {
	log("sending init values: ", suggestedNick, session, room);
	core.emit('init', {
			suggestedNick: suggestedNick,
			session: session,
			to: "me",
			type: "init",
			origin: {
				gateway: "irc",
				server: room.params.irc.server
			}
		}, function(err, init) {
			log("init back", init);
			
			if (init.user.id !== suggestedNick) 
			clientEmitter.emit('write', {
				type: "newNick",//change mapping only.
				nick: suggestedNick,//from,
				sbNick: init.user.id ,//init.from,
				roomId: room.id
			});
			//gen back messages.
			core.emit('back', {
					id: guid(),
					type: 'back',
					to: room.id,
					session: session,
					from: init.user.id//nick returned from init.
				}, function(text) {
			});
			initCount--;
			isInitDone();
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
		options: {identId: user + "@scrollback.io"}
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
		roomId: roomId
	});
}

function disconnectUser(roomId, user) {
	var uid = guid();
	clientEmitter.emit('write', {
		uid: uid,
		type: 'partUser',
		roomId: roomId,
		nick: user
	});
}


/*new Request.*/
function addNewBot(r, callback) {
	console.log("room irc Adding new bot for room :", r.id);
	var room  = copyRoomOnlyIrc(r);
	var uid = guid();
	clientEmitter.emit('write', {
		uid: uid,
		type: 'connectBot',
		room: room,
		options: {identId: "scrollback@scrollback.io"}
	});
	if (callback) {
		callbacks[uid] = function(message) {
			if(message) room.params.irc.message = message;
			callback();
		};
	}
}
/**
 * Copy only roomId and IRC params.
 */
function copyRoomOnlyIrc(room) {
	return {id: room.id, params: {irc: room.params.irc}};
}

function getBotNick(roomId, callback) {
	var uid = guid();
	clientEmitter.emit('write', {
		uid: uid,
		type: 'getBotNick',
		roomId: roomId
	});
	callbacks[uid] = function(data) {
		callback(data.nick);
	};
}


function getRequest(req, res, next) {
	var path = req.path.substring(7);// "/r/irc/"
	log("path " , path , req.url );
	var ps = path.split('/');
	if (ps[0]) {//room name
		getBotNick(ps[0], function(nick) {
			log("nick for room :", ps[0], nick);
			if (nick === "NO_ROOM") {//error 
				next();//say invalid req(404)
			} else {
				res.write(nick);
				res.end();
			}
		});
	}
}
