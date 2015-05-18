"use strict";
/*
	Scrollback: Beautiful text chat for your community.
	Copyright (c) 2014 Askabt Pte. Ltd.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or any
later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see http://www.gnu.org/licenses/agpl.txt
or write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330,
Boston, MA 02111-1307 USA.
*/

/*
	Websockets gateway
*/

/* global require, exports, setTimeout */

var sockjs = require("sockjs"),
	core,
	log = require("../lib/logger.js"),
	SbError = require("../lib/SbError.js"),
	generate = require("../lib/generate.js");

var rConns = {},
	uConns = {},
	sConns = {},
	urConns = {};
var sock = sockjs.createServer();

sock.on('connection', function(socket) {
	if (socket === null) return; // issue : https://github.com/sockjs/sockjs-node/issues/121
	var conn = {
		socket: socket
	};
	var ip = socket.remoteAddress;
	if (socket.headers && socket.headers["x-forwarded-for"]) {
		ip = socket.headers["x-forwarded-for"];
	}
	log("socket:", ip);
	socket.on('data', function(d) {
		try {
			d = JSON.parse(d);
			log("Socket received ", d);
		} catch (e) {
			log("ERROR: Non-JSON data", d);
			return;
		}

		if (!d.type) return;
		if (d.type === 'init' && d.session) {
			if (!/^web:/.test(d.session)) {
				return conn.send(getErrorObject(d, "INVALID_SESSION"));
			}
			if (!d.origin) return conn.send(getErrorObject(d, "INVALID_ORIGIN"));
			if (!conn.session) conn.listeningTo = [];
			conn.session = d.session; // Pin the session and resource.
			conn.resource = d.resource;
			conn.origin = d.origin;
			conn.origin.client = ip;
			if (!sConns[d.session]) {
				sConns[d.session] = [];
				sConns[d.session].push(conn);
			} else {
				if (sConns[d.session].indexOf(conn) === -1) {
					sConns[d.session].push(conn);
				}
			}
		} else if (conn.session) {
			d.session = conn.session;
			d.resource = conn.resource;
			d.origin = conn.origin;
		}

		if (d.type === 'back') {
			//just need for back as storeBack will be called before actionValidator
			if (!d.to) {
				return conn.send(getErrorObject(d, "INVALID_ROOM"));
			} else if (!d.from) {
				return conn.send(getErrorObject(d, "INVALID_USER"));
			}
			if (!verifyBack(conn, d)) {
				storeBack(conn, d);
				conn.send(d);
				return;
			}
		}
		log.i("Reached here:", d);
		core.emit(d.type, d, function(err, data) {
			var e, action;
            log.i("response", err, data);
			if (err) {
				e = {
					type: 'error',
					id: d.id,
					message: err.message
				};
				if (err instanceof SbError) {
					for (var i in err) {
						e[i] = err[i];
					}
				}
				/* e = err;
				e.id = d.id;
				e.type = 'error';
				e.message = err.message; */
				log("Sending Error: ", e);
				return conn.send(e);
			}
			if (data.type === 'back') {
				/* this is needed because we dont have the connection object
				of the user in the rconn until storeBack is called*/
				conn.send(censorAction(data, "room"));
				storeBack(conn, data);
				return;
			}
			if (data.type === 'room') {
				/* this is need because we dont have the connection object in the
				rconn until the room can be setup and a back message is sent.*/
				if (!data.old || !data.old.id) conn.send(data);
				// return;
			}
			if (data.type === 'away') storeAway(conn, data);
			if (data.type === 'init') {
				if (data.old) {
					log.i("Occupant of: ", data.occupantOf);
					data.occupantOf.forEach(function(room) {
						var role, cnt, l;
						for (cnt = 0, l = data.memberOf.length; cnt < l; cnt++) {
							if (data.memberOf[cnt].id === room.id) {
								role = data.memberOf[cnt].role;
								break;
							}
						}

						data.user.role = role;
						action = {
							id: generate.uid(),
							type: "back",
							to: room.id,
							from: data.user.id,
							session: data.session,
							user: data.user,
							room: room
						};
						emit({
							id: generate.uid(),
							type: "away",
							to: room.id,
							from: data.old.id,
							user: data.old,
							room: room
						});

						if (conn.listeningTo && conn.listeningTo.indexOf(room.id) >= 0) {
							if (verifyBack(conn, action)) emit(action);
							storeBack(conn, action);
						}

					});
				}
				storeInit(conn, data);
			}
			if (data.type === 'user') processUser(conn, data);
			if (['getUsers', 'getTexts', 'getRooms', 'getThreads', 'getEntities'].indexOf(data.type) >= 0) {
				var t = data.eventStartTime; //TODO: copy properties of each query that is needed on client side.
				delete data.eventStartTime;
                log.d("sending response", data);
				conn.send(data);
				data.eventStartTime = t;
			}
		});
	});

	conn.send = function(data) {
		socket.write(JSON.stringify(data));
	};
	socket.on('close', function() {
		handleClose(conn);
	});
});

function processUser(conn, user) {
	if (/^guest-/.test(user.from)) {
		core.emit("init", {
			time: new Date().getTime(),
			to: 'me',
			origin: conn.origin,
			session: conn.session,
			resource: conn.resource,
			type: "init"
		});
	}
}

function storeInit(conn, init) {
	if (!uConns[init.user.id]) uConns[init.user.id] = [];
	if (uConns[init.user.id].indexOf(conn) < 0) uConns[init.user.id].push(conn);

	if (init.old && init.old.id) {
		sConns[init.session].forEach(function(c) {
			var index;

			if (init.old.id !== init.user.id && uConns[init.old.id]) {
				index = uConns[init.old.id].indexOf(c);
				uConns[init.old.id].splice(index, 1);
			}
			init.occupantOf.forEach(function(room) {
				if (urConns[init.old.id + ":" + room.id]) {
					index = urConns[init.old.id + ":" + room.id].indexOf(c);
					urConns[init.old.id + ":" + room.id].splice(index, 1);
					if (c.listeningTo.indexOf(room) >= 0) {
						if (!urConns[init.user.id + ":" + room.id]) urConns[init.user.id + ":" + room.id] = [];
						if (urConns[init.user.id + ":" + room.id].indexOf(c) < 0) urConns[init.user.id + ":" + room.id].push(c);
					}

				}
			});
		});
	}

}

function storeBack(conn, back) {
	if (!rConns[back.to]) rConns[back.to] = [];
	if (!urConns[back.from + ":" + back.to]) urConns[back.from + ":" + back.to] = [];
	if (!uConns[back.from]) uConns[back.from] = [];
	if (rConns[back.to].indexOf(conn) < 0) rConns[back.to].push(conn);
	if (urConns[back.from + ":" + back.to].indexOf(conn) < 0) urConns[back.from + ":" + back.to].push(conn);
	if (!conn.listeningTo) conn.listeningTo = [];
	if (conn.listeningTo.indexOf(back.to) < 0) {
		conn.listeningTo.push(back.to);
	}

	//    console.log("LOG:"+ back.from +" got back from :"+back.to);
}


function storeAway(conn, away) {
	var index;
	delete urConns[away.from + ":" + away.to];
	if (sConns[away.session] && !sConns[away.session].length) {
		delete sConns[away.session];
	}
	if (uConns[away.session] && !uConns[away.session].length) {
		delete uConns[away.session];
	}
	if (urConns[away.from + ":" + away.to]) delete urConns[away.from + ":" + away.to];
	if (conn.listeningTo) {
		index = conn.listeningTo.indexOf(away.to);
		if (index >= 0) conn.listeningTo.splice(index, 1);
	}
}

exports.initServer = function(server) {
	sock.installHandlers(server, {
		prefix: '/socket'
	});
};

exports.initCore = function(c) {
	core = c;
	// api(core);
	["init", 'away', 'back', 'join', 'part', 'room', 'user', 'admit', 'expel', 'edit', 'text'].
	forEach(function(e) {
		core.on(e, emit, "webGateway");
	});
};

function censorAction(action, filter) {
	var outAction = {},
		i, j;
	for (i in action) {
		if (action.hasOwnProperty(i)) {
			if (i === "room" || i === "user") {
				outAction[i] = {};
				for (j in action[i]) {
					if (action[i].hasOwnProperty(j)) {
						outAction[i][j] = action[i][j];
					}
				}
			} else {
				outAction[i] = action[i];
			}
		}
	}
	if (outAction.origin) delete outAction.origin;
	if (outAction.eventStartTime) delete outAction.eventStartTime; //TODO: copy properties
	if (filter === 'both' || filter === 'user') {
		outAction.user = {
			id: action.user.id,
			picture: action.user.picture,
			createTime: action.user.createTime,
			role: action.user.role,
			type: 'user'
		};
		delete outAction.session;
	}

	if (filter === 'both' || filter === 'room') {
		delete outAction.room.identities;
		delete outAction.room.params;
	}

	return outAction;
}

function emit(action, callback) {
	var outAction, myAction, error;
	log("Sending out: ", action);

	function dispatch(conn, a) {
		conn.send(a);
	}

	if (action.type === 'init') {
		if (sConns[action.session]) {
			if(action.response) {
				error = action.response;
				action.response = {
					message: action.response.message
				};
			}
			sConns[action.session].forEach(function(conn) {
				conn.user = action.user;
				dispatch(conn, action);
			});
			
			if(error) action.response = error;
		}
		return callback();
	} else if (action.type === 'user') {
		if (uConns[action.from] && uConns[action.from].length) {
			uConns[action.from].forEach(function(e) {
				dispatch(e, action);
			});
		}
		return callback();
	}

	outAction = censorAction(action, "both");
	myAction = censorAction(action, "room");

	if (rConns[action.to]) {
		rConns[action.to].forEach(function(e) {
			if (e.session === action.session) {
				if (action.type === "room") dispatch(e, action);
				else dispatch(e, myAction);
			} else {
				dispatch(e, outAction);
			}
		});
	}

	if (callback) callback();
}

function handleClose(conn) {
	if (!conn.session) return;
	core.emit('getUsers', {
		ref: "me",
		session: conn.session
	}, function(err, sess) {
		var user;
		if (err || !sess || !sess.results) {
			log("Couldn't find session to close.", err, sess);
			return;
		}
		user = sess.results[0];
		setTimeout(function() {
			if (!conn.listeningTo || !conn.listeningTo.length) return;

			conn.listeningTo.forEach(function(room) {
				var awayAction = {
					from: user.id,
					session: conn.session,
					type: "away",
					to: room,
					time: new Date().getTime()
				};

				if (!verifyAway(conn, awayAction)) return;
				core.emit('away', awayAction, function(error, action) {
					if (error) return;
					storeAway(conn, action);
				});

			});
		}, 30 * 1000);
	});
}

function verifyAway(conn, away) {
	var index;
	if (rConns[away.to]) {
		index = rConns[away.to].indexOf(conn);
		if (index >= 0) rConns[away.to].splice(index, 1);
	}
	if (sConns[conn.session]) {
		index = sConns[conn.session].indexOf(conn);
		if (index >= 0) sConns[conn.session].splice(index, 1);
	}
	if (uConns[away.from]) {
		index = uConns[away.from].indexOf(conn);
		if (index >= 0) uConns[away.from].splice(index, 1);
	}
	if (urConns[away.from + ":" + away.to]) {
		index = urConns[away.from + ":" + away.to].indexOf(conn);
		if (index >= 0) urConns[away.from + ":" + away.to].splice(index, 1);
		// console.log("LOG: "+ away.from +"Connections still available: ", urConns[away.from+":"+away.to].length);
		return (urConns[away.from + ":" + away.to].length === 0);
	} else {
		return true;
	}
}

function verifyBack(conn, back) {
	if (!urConns[back.from + ":" + back.to]) return true;
	return (urConns[back.from + ":" + back.to].length === 0);
}

function getErrorObject(action, message) {
	return {
		type: 'error',
		id: action.id,
		message: message
	};
}
