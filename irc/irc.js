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
var onlineUsers = {};//scrollback users that are already online 
var firstMessage = {};//[room][username] = true
var userExp = 10*60*1000;
var initCount = 0;
var ircUtils = new require('./ircUtils.js')(clientEmitter, client,callbacks);
var debug = config.irc.debug;
module.exports = function (coreObj) {
	core = coreObj;
	init();
	core.on("http/init", function(payload, callback) {
		payload.irc = {
			get: function(req,res,next) {	
				ircUtils.getRequest(req,res,next);
			}
		};
		callback(null, payload);
	}, "setters");
	
    
    
    function removeIrcIdentity(room) {
        var i,l;
        for(i=0,l=room.identities; i<l; i++) {
            if(/^irc:/.text(room.identities[i])) {
                room.identities.splice(i,1);
                break;
            }
        }
    }
	core.on ('room', function(action, callback) {
        var room = action.room;
		log("room irc:", JSON.stringify(action), client.connected());
        
        if(!room.params.irc || room.params.irc.error) return callback();
        
        function done(err) {
            if(err) {
                room.params.irc.error = err.message;
                removeIrcIdentity(room);
                return ircUtils.disconnectBot(room.id,callback);
            }
            callback();
        }
		if (action.session === internalSession) return callback();
		if (actionRequired(action) && client.connected()) {
			changeRoomParams(action);
			if (isNewRoom(action)) {//TODO check if new irc config.
				room.params.irc.channel = room.params.irc.channel.toLowerCase();
				return ircUtils.addNewBot(room, done);
			} else {//room config changed
				var oldIrc = action.old.params.irc;
				var newIrc = room.params.irc;
                
                if (oldIrc.server === newIrc.server && oldIrc.channel === newIrc.channel) {
                    room.params.irc = action.old.params.irc;
                    if(room.params.irc.error) removeIrcIdentity(room);
                    return callback();
                }else if (oldIrc.server !== newIrc.server || oldIrc.channel !== newIrc.channel) {
					if(oldIrc.server && oldIrc.channel) {
						delete firstMessage[room.id];
						ircUtils.disconnectBot(room.id, function() {
							if(room.params.irc.server && room.params.irc.channel) return ircUtils.addNewBot(room, done);	
							else return callback();
						});
					} else if(room.params.irc.server && room.params.irc.channel) return ircUtils.addNewBot(room, done);
					else return callback();
				} else{
                    return callback();
                }
			}  
		} else if(!client.connected() && room.params.irc && room.params.irc.server && room.params.irc.channel) {
			done(new Error("ERR_IRC_NOT_CONNECTED"));
		} else return callback();
	}, "gateway");

	core.on("room", function(room, callback) {
		var r = room.room;
		if (r.params.irc && Object.keys(r.params.irc).length >0) {
			var v = (typeof r.params.irc.server === 'string') && (typeof r.params.irc.channel === 'string');
			if (v) {
				callback();
			} else {
				r.params.irc.error = "ERR_INVALID_IRC_PARAMS";
                removeIrcIdentity(room);
				callback();//
			}
		} else callback();
	}, "appLevelValidation");
	core.on("init", function(init, callback) {
		log("init irc:", init);
		var oldUser = {id: init.from};
		var newUser = init.user;
		
		if (oldUser && newUser && oldUser.id !== newUser.id) {
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
		log("text called irc:", JSON.stringify(text));
		log("online users:", onlineUsers);
		if (text.room.params && text.room.params.irc && text.room.params.irc.server &&
			text.room.params.irc.channel && !text.room.params.irc.pending &&
			(text.session.indexOf('irc') !== 0 && text.session.indexOf('twitter') !== 0) && client.connected()) {//session of incoming users from irc 
			if(!(firstMessage[text.to] && firstMessage[text.to][text.from])) {
				if (!firstMessage[text.to]) {
					firstMessage[text.to] = {};
				}
				firstMessage[text.to][text.from] = true;
				if (onlineUsers[text.to] && onlineUsers[text.to][text.from]) {
					delete onlineUsers[text.to][text.from];
				} else ircUtils.connectUser(text.to, text.from);
			}
			if (text.labels) {
				if(text.labels.action) text.text += '/me ' + text.text;
			}
			ircUtils.say(text.to, text.from, text.text);
		}
		callback();
	}, "gateway");
	
	core.on('away', function(action, callback) {
		log("On away:", client.connected());
		if (action.room.params && action.room.params.irc && action.room.params.irc.server &&
			action.room.params.irc.channel && !action.room.params.irc.pending &&
			(action.session.indexOf('irc') !== 0 && action.session.indexOf('twitter') !== 0) && client.connected()) {//session of incoming users from irc 
			if(firstMessage[action.to] && firstMessage[action.to][action.from]) {
				ircUtils.disconnectUser(action.to, action.from);
				delete firstMessage[action.to][action.from];
			}
		}
		callback();
	}, "gateway");	
};

function actionRequired(room) {
	return (room.room.params && room.room.params.irc &&
			room.room.params.irc.server && room.room.params.irc.channel) ||
			(room.old && room.old.params && room.old.params.irc && room.old.params.irc.server &&
			room.old.params.irc.channel);// old or new 
}

/**
 *add or copy pending status 
 */
function changeRoomParams(room) {
	room.room.params.irc.enabled = true;
	var or = room.old;
	if (or && or.id && or.params.irc && or.params.irc.server && or.params.irc.channel) { //this is old room
		if (room.room.params.irc.server !== or.params.irc.server || or.params.irc.channel !== room.room.params.irc.channel) {
			room.room.params.irc.pending = debug ? false : true;//if server or channel changes
		} else room.room.params.irc.pending = or.params.irc.pending;	
	} else {
		room.room.params.irc.pending = debug? false: true;//this is new room.
	}
}

function isNewRoom(room) {
	var or = room.old;
	if (or && or.id && or.params.irc && or.params.irc.server && or.params.irc.channel ) { //this is old room
		return false;
	} else {
		return true;
	}
}

function init() {
	var notUsedRooms = {};
	clientEmitter.on('init', function(st) {
		initCount = 0;
		firstMessage = {};
		onlineUsers = {};
		var state = st.state;
		for(var roomId in state.rooms) {
			if(state.rooms.hasOwnProperty(roomId)) {
				notUsedRooms[roomId] = true;
			}
		}
		log("init from ircClient", state);

		core.emit("getRooms", {identity: "irc", session: internalSession}, function(err, data) {
			var rooms = data.results;
			log("returned state from IRC:", JSON.stringify(state));
			log("results of getRooms: ", rooms);
			rooms.forEach(function(room) {
				if (state.rooms[room.id]) {
					var r1 = room.params.irc;
					var r2 = state.rooms[room.id].params.irc;
					if (!(r1.server === r2.server && r1.channel === r2.channel && r1.pending === r2.pending)) {
						log("reconnecting bot with new values:", room.id);
						ircUtils.disconnectBot(state.rooms[room.id].id, function() {
							ircUtils.addNewBot(room); 
						});
					}
					delete notUsedRooms[room.id];
				} else {
					log("adding new Bot", room);
					ircUtils.addNewBot(room);
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
								if(	onlineUsers[room.id] && onlineUsers[room.id][servNick[room.params.irc.server][user].nick]) {
									log("disconnecting user ", servNick[room.params.irc.server][user].nick, " from ", room.id);
									ircUtils.disconnectUser(room.id, servNick[room.params.irc.server][user].nick);
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
					ircUtils.disconnectBot(ri);
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
		var labels = {};
		if (data.text.indexOf('/me ') === 0) {
			data.text = data.text.substring(4);
			labels.action = 1;
		}
		core.emit('text', {
			id: guid(),
			type: 'text',
			to: data.to,
			from: data.from,
			text: data.text,
			labels: labels,
			time: data.time ? data.time : new Date().getTime(),
			session: data.session
		}, function(err, message) {
			log("message",  err, message);
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
				}, function(err, back) {
                    if(err) log("Error:", err.message);
			});
			initCount--;
			isInitDone();
	});
}

