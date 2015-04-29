var gen = require("../lib/generate.js");
var guid = gen.uid;
var log = require("../lib/logger.js");
var config;

module.exports = function(conf, clientEmitter, client, callbacks) {
	config = conf;
	function connectUser(roomId, user, origin) {
		var uid = guid();
		console.log("connecting user:", user, uid);
		clientEmitter.emit('write', {
			uid: uid,
			type: "connectUser",
			roomId: roomId,
			nick: user,
			options: {
				identId: user + "@scrollback.io", 
				userIp: origin.client, 
				userHostName: origin.client,
				userName: user
			}
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
		return {id: room.id, params: {
			irc: {
				server: room.params.irc.server,
				channel: room.params.irc.channel,
				pending: room.params.irc.pending,
				enabled: room.params.irc.enabled
			}
		}};
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
				if (!nick || typeof nick !== 'string' || nick === "NO_ROOM") {//error
					next();//say invalid req(404)
				} else {
					res.write(nick);
					res.end();
				}
			});
		}
	}
    
	function copyChannel(action) {
		[action.room, action.old].forEach(function (r) {
			if (r && r.params && r.params.irc && r.params.irc.channel) {
				r.params.irc.tmpChannel = r.params.irc.channel;
				r.params.irc.channel = r.params.irc.channel.toLowerCase();
			}
		});
	}

	function revertCopyChannel(action) {
			[action.room, action.old].forEach(function (r) {
			if (r && r.params && r.params.irc && r.params.irc.channel) {
				r.params.irc.channel = r.params.irc.tmpChannel;
				delete r.params.irc.tmpChannel;
			}
		});
	}


	/**
	channel to lower case for both room and old
	@returns {function}. to revert the changes
	*/
	function channelLowerCase(action, cb) {
		copyChannel(action);
		return function () {
			revertCopyChannel(action);
			var args = [];
			for (var k in arguments) {
				if (arguments.hasOwnProperty(k)) {
					args.push(arguments[k]);
				}
			}
			cb.apply(null, args);
		};
	}

	function isActionReq(action) {
		var rp = action.room.params;
		return (rp && rp.irc && rp.irc.server && rp.irc.channel && !rp.irc.pending &&
			(/^web/).test(action.session) && client.connected() && rp.irc.enabled && !rp.irc.error);	
	}
	
	function ircfyText(message) {
		var l = 400 - message.room.params.irc.channel.length;
		if (message.text.length <= l) {
			return message.text;
		} else {
			var suffix = "... [ full message at http://" + config.global.host + "/" + message.to + "?time=" + 
				new Date(message.time).toISOString() + "&tab=people" + " ]";	
			var r = message.text.substring(0, l - suffix.length) + suffix;
			return r;
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
		channelLowerCase: channelLowerCase,
		isActionReq: isActionReq,
		ircfyText: ircfyText
	};
};
