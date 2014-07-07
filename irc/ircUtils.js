var gen = require("../lib/generate.js");
var guid = gen.uid;
var config = require('../config.js');
var log = require("../lib/logger.js");
var debug = config.irc.debug;
module.exports = function(clientEmitter, client, callbacks) {

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
	
	function disconnectBot(roomId, callback) {
		var uid = guid();
		clientEmitter.emit('write', {
			uid: uid,
			type: 'partBot',
			roomId: roomId
		});
		if(callback) callbacks[uid] = callback;
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
                if(message) callback(new Error(message));
                else callback();
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
		if(client.connected()) {
			clientEmitter.emit('write', {
				uid: uid,
				type: 'getBotNick',
				roomId: roomId
			});
			callbacks[uid] = function(data) {
				callback(data.nick);
			};
		} else callback("ERR_NOT_CONNECTED");
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
	
	function removeIrcIdentity(room) {
		var i,l;
		for(i=0,l=room.identities; i<l; i++) {
			if(/^irc:/.text(room.identities[i])) {
				room.identities.splice(i,1);
				break;
			}
		}
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
			room.room.params.irc.pending = debug ? false: true;//this is new room.
		}
	}
	
	function actionRequired(room) {
		return (room.room.params && room.room.params.irc &&
				room.room.params.irc.server && room.room.params.irc.channel) ||
			(room.old && room.old.params && room.old.params.irc && room.old.params.irc.server &&
			 room.old.params.irc.channel);// old or new 
	}
	
	function isNewRoom(room) {
		var or = room.old;
		if (or && or.id && or.params.irc && or.params.irc.server && or.params.irc.channel ) { //this is old room
			return false;
		} else {
			return true;
		}
	}
	
	return {
		connectUser: connectUser,
		say: say,
		disconnectBot: disconnectBot,
		disconnectUser: disconnectUser,
		addNewBot: addNewBot,
		copyRoomOnlyIrc: copyRoomOnlyIrc,
		getBotNick: getBotNick,
		getRequest: getRequest,
		removeIrcIdentity: removeIrcIdentity,
		changeRoomParams: changeRoomParams,
		actionRequired: actionRequired,
		isNewRoom: isNewRoom
	};
};