var log = require("../lib/logger.js");
var debug, config;
module.exports = function (core, conf, client, ircUtils, firstMessage) {
	config = conf;
	debug = config.debug;
	
	core.on("room", function (action, cb) {
		var callback = ircUtils.channelLowerCase(action, cb);
		var r = action.room;
		var or = action.old;
		if (r.params.irc && Object.keys(r.params.irc).length > 0) {
			var v = (typeof r.params.irc.server === 'string') && (typeof r.params.irc.channel === 'string');
			if (!v) return callback(new Error("ERR_INVALID_IRC_PARAMS"));
			if(r.params.irc.server && r.params.irc.channel) {
				r.identities = r.identities.filter(function(e){return !/^irc/.test(e);});
				r.identities.push("irc://" + r.params.irc.server + "/" + r.params.irc.channel);
			}
			if (or && or.id && or.params.irc && or.params.irc.error === "ERR_IRC_NOT_CONNECTED" &&
				client.connected()) { //if client is connected then remove not connected error
				delete or.params.irc;
			}
			core.emit('getRooms', {
				identity: "irc://" + r.params.irc.server + "/" + r.params.irc.channel,
				session: "internal-irc"
			}, function (err, reply) {
				var room = reply.results;
				if (!room[0]) callback();
				else if (room[0].id === r.id) callback();
				else {
					r.params.irc.error = "ERR_CONNECTED_OTHER_ROOM";
                    removeIrcIdentity(room[0]);
					callback();
				}
			});
		} else callback();
	}, "appLevelValidation");
	
	core.on('room', function (action, cb) {
		var callback = ircUtils.channelLowerCase(action, cb);
		var room = action.room;
		log("room irc:", JSON.stringify(action), client.connected());
		if (!room.params.irc || room.params.irc.error || /^internal-/.test(action.session)) return callback();

		function done(err) {
			if (err) {
				room.params.irc.error = err.message;
				removeIrcIdentity(room);
				ircUtils.disconnectBot(room.id, callback);
			} else callback();
		}
		if (actionRequired(action) && client.connected()) {
			addPending(action);
			var newIrc = room.params.irc;
			if (isNewRoom(action)) {
				newIrc.channel = newIrc.channel.toLowerCase();
				if (newIrc.enabled) return ircUtils.addNewBot(room, done);
				else return callback();
			} else { //room config changed
				var oldIrc = action.old.params.irc;
				if (oldIrc.server === newIrc.server && oldIrc.channel === newIrc.channel) { //server channel same.
					newIrc.error = oldIrc.error;
					if (newIrc.error) removeIrcIdentity(room);
					if (oldIrc.enabled !== newIrc.enabled) {
						if (newIrc.enabled) {
							delete firstMessage[room.id];
							return ircUtils.addNewBot(room, done);
						} else {
							delete firstMessage[room.id];
							ircUtils.disconnectBot(room.id, function () {
								log("Disconnected room", room.id);
							});
						}
					}
					return callback();

				} else if (oldIrc.server !== newIrc.server || oldIrc.channel !== newIrc.channel) {
					if (oldIrc.server && oldIrc.channel) {
						delete firstMessage[room.id];
						ircUtils.disconnectBot(room.id, function () {
							if (newIrc.server && newIrc.channel && newIrc.enabled) return ircUtils.addNewBot(room, done);
							else return callback();
						});
					} else if (newIrc.server && newIrc.channel && newIrc.enabled) return ircUtils.addNewBot(room, done);
					else return callback();
				} else {
					return callback();
				}
			}
		} else if (!client.connected() && isIrcChanged(action)) {
			log("irc Client is not connected: ");
			room.params.irc.error = "ERR_IRC_NOT_CONNECTED";
			removeIrcIdentity(room);
			return callback();
		} else return callback();
	}, "gateway");
};


/**
 *add or copy pending status
 */
function addPending(action) {
    var or = action.old;
    var p = debug || (action.user.role === 'su');
    if (or && or.id && or.params.irc && or.params.irc.server && or.params.irc.channel) { //this is old room
        if (action.room.params.irc.server !== or.params.irc.server || or.params.irc.channel !== action.room.params.irc.channel) {
            action.room.params.irc.pending = p ? false : true; //if server or channel changes
        } else action.room.params.irc.pending = or.params.irc.pending;
    } else {
        action.room.params.irc.pending = p ? false : true; //this is new room.
    }
}

function actionRequired(room) {
	return (room.room.params && room.room.params.irc &&
			room.room.params.irc.server && room.room.params.irc.channel) ||
		(room.old && room.old.params && room.old.params.irc && room.old.params.irc.server &&
			room.old.params.irc.channel); // old or new
}

function isNewRoom(room) {
	var or = room.old;
	if (or && or.id && or.params.irc && or.params.irc.server && or.params.irc.channel) { //this is old room
		return false;
	} else {
		return true;
	}
}

function isIrcChanged(action) {
	var or = action.old && action.old.params && action.old.params.irc;
	var nr = action.room && action.room.params && action.room.params.irc;
	return or && nr && (nr.server !== or.server || or.channel !== nr.channel);
}

function removeIrcIdentity(room) {
	var i;
	for (i = 0; i < room.identities.length; i++) {
		if (/^irc:/.test(room.identities[i])) {
			room.identities.splice(i, 1);
			break;
		}
	}
}
