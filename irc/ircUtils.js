var gen = require("../lib/generate.js");
var guid = gen.uid;
var log = require("../lib/logger.js");
module.exports = function(clientEmitter, callbacks) {

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
				if(message) return callback(new Error(message));
				else return callback();
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
	
	return {
		connectUser: connectUser,
		say: say,
		disconnectBot: disconnectBot,
		disconnectUser: disconnectUser,
		addNewBot: addNewBot,
		copyRoomOnlyIrc: copyRoomOnlyIrc,
		getBotNick: getBotNick,
		getRequest: getRequest
	};
};