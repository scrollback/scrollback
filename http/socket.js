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

"use strict";

var engine = require("engine.io"),
	log = require("../lib/logger.js"),
	SbError = require("../lib/SbError.js");

module.exports = function(core) {
	var rConns = {},
		uConns = {},
		sConns = {},
		urConns = {};

	function getErrorObject(action, message) {
		return {
			type: "error",
			id: action.id,
			message: message
		};
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

			return (urConns[away.from + ":" + away.to].length === 0);
		} else {
			return true;
		}
	}

	function verifyBack(conn, back) {
		if (!urConns[back.from + ":" + back.to]) return true;
		return (urConns[back.from + ":" + back.to].length === 0);
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
	}

	function storeAway(conn, away) {
		var index;

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
				} else if (i !== "occupants" && i !== "members") {
					outAction[i] = action[i];
				}
			}
		}

		if (outAction.origin) delete outAction.origin;
		if (outAction.eventStartTime) delete outAction.eventStartTime; //TODO: copy properties

		if (filter === "both" || filter === "user") {
			outAction.user = {
				id: action.user.id,
				picture: action.user.picture,
				createTime: action.user.createTime,
				role: action.user.role,
				type: "user"
			};

			delete outAction.session;
		}

		if (filter === "both" || filter === "room") {
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

		if (action.type === "init") {
			if (sConns[action.session]) {
				if (action.response) {
					error = action.response;
					action.response = {
						message: action.response.message
					};
				}

				sConns[action.session].forEach(function(conn) {
					conn.user = action.user.id;
					dispatch(conn, action);
				});

				if (error) action.response = error;
			}

			return callback();
		} else if (action.type === "user") {
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
				var note = {}, i;

				if (e.session === action.session) {
					if (action.type === "room") {
						dispatch(e, action);
					} else {
						dispatch(e, myAction);
					}
				} else {
					log.d(outAction.notify, e.user);

					if (outAction.note && outAction.notify && outAction.notify[e.user]) {
						for (i in outAction.note) {
							if (outAction.note.hasOwnProperty(i)) {
								note[i] = {};

								for (var j in outAction.note[i]) {
									if (outAction.note[i].hasOwnProperty(j)) {
										note[i][j] = outAction.note[i][j];
									}
								}
							}
						}


						log.d(outAction.notify[e.user]);

						for (i in outAction.notify[e.user]) {
							if (outAction.notify[e.user].hasOwnProperty(i)) {
								note[i].score = outAction.notify[e.user][i];
							}

							log.d(i, note);
						}
						
						outAction.note = note;
					}
					delete outAction.notify;

					log.d("diapatching: ", e.user, outAction);

					dispatch(e, outAction);
				}
			});
		}

		if (callback) callback();
	}

	function handleClose(conn) {
		if (!conn.session) return;

		core.emit("getUsers", {
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
						origin: conn.origin,
						time: new Date().getTime()
					};

					if (!verifyAway(conn, awayAction)) return;
					core.emit("away", awayAction, function(error, action) {
						if (error) return;
						storeAway(conn, action);
					});

				});
			}, 30 * 1000);
		});
	}

	function processUser(conn, action) {
		if (/^guest-/.test(action.from)) {
			core.emit("init", {
				time: new Date().getTime(),
				to: "me",
				origin: conn.origin,
				session: conn.session,
				resource: conn.resource,
				type: "init"
			});

			uConns[action.user.id] = uConns[action.from];
			delete uConns[action.from];
		}
	}

	function changeUser(conn, init) {
		if (!uConns[init.user.id]) uConns[init.user.id] = [];
		if (uConns[init.user.id].indexOf(conn) < 0) uConns[init.user.id].push(conn);

		conn.user = init.user.id;

		if (init.old && init.old.id && init.old.id !== init.user.id) {
			sConns[init.session].forEach(function(c) {
				var index;

				if (uConns[init.old.id]) {
					index = uConns[init.old.id].indexOf(c);
					if (index >= 0) uConns[init.old.id].splice(index, 1);
				}

				c.listeningTo = [];
			});

			init.occupantOf.map(function(e) { return e.id; }).forEach(function(roomID) {
				urConns[init.old.id + ":" + roomID] = [];
				urConns[init.old.id + ":" + roomID] = [];
			});
		}
	}

	function initServer(http) {
		var server = engine.attach(http);

		server.on("connection", function(socket) {
			var conn = {
					socket: socket,
					send: function(data) {
						socket.write(JSON.stringify(data));
					}
				},
				ip = socket.request.connection.remoteAddress;

			// Works only under nginx as we need to add the request header
			if (socket.request && socket.request.headers && socket.request.headers["x-forwarded-for"]) {
				ip = socket.request.headers["x-forwarded-for"];
			}

			log("socket ip address:", ip);

			socket.on("data", function(d) {
				try {
					d = JSON.parse(d);

					log("Socket received ", d);
				} catch (e) {
					log("ERROR: Non-JSON data", d);

					return null;
				}

				if (!d.type) return null;

				if (d.type === "init" && d.session) {
					if (!/^web:/.test(d.session)) {
						return conn.send(getErrorObject(d, "INVALID_SESSION"));
					}

					if (!d.origin) {
						return conn.send(getErrorObject(d, "INVALID_ORIGIN"));
					}

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
				} else {
					if (conn.session) {
						d.session = conn.session;
						d.resource = conn.resource;
						d.origin = conn.origin;
					} else {
						return conn.send({
							type: "error",
							id: d.id,
							actionType: d.type,
							message: "SESSION_NOT_INITED"
						});
					}
				}

				if (d.type === "back") {
					//just need for back as storeBack will be called before actionValidator
					if (!d.to) {
						return conn.send(getErrorObject(d, "INVALID_ROOM"));
					} else if (!d.from) {
						return conn.send(getErrorObject(d, "INVALID_USER"));
					}
					if (!verifyBack(conn, d)) {
						storeBack(conn, d);

						return conn.send(d);
					}
				}

				log.i("Reached here:", d);

				core.emit(d.type, d, function(err, data) {
					var e, victimId, victimSession, victimConns, awayAction;

					log.i("response", err, data);

					if (err) {
						log.d("Error thrown: ", new Error().stack);

						e = {
							type: "error",
							id: d.id,
							actionType: d.type,
							message: err.message
						};

						if (err instanceof SbError) {
							for (var i in err) {
								e[i] = err[i];
							}
						}

						log("Sending Error: ", e);

						return conn.send(e);
					}

					if (data.type === "back") {
						/* this is needed because we dont have the connection object
						of the user in the rconn until storeBack is called*/
						conn.send(censorAction(data, "room"));

						storeBack(conn, data);

						return null;
					}

					if (data.type === "room") {
						/* this is need because we dont have the connection object in the
						rconn until the room can be setup and a back message is sent.*/
						if (!data.old || !data.old.id) conn.send(data);
						// return;
					}

					if (data.type === "away") storeAway(conn, data);

					if (data.type === "expel") {
						if (data.role === "banned") {
							victimId = data.victim.id;
							victimConns = uConns[victimId];

							if (victimConns && victimConns.length) {
								victimSession = victimConns[0].session;

								awayAction = {
									type: "away",
									to: data.room.id,
									from: victimId,
									session: victimSession
								};

								core.emit("away", awayAction);
							}
						}
					}

					if (data.type === "init") {
						changeUser(conn, data);
					}

					if (data.type === "user") {
						changeUser(conn, data);
						processUser(conn, data);
					}

					if (["getUsers", "getTexts", "getRooms", "getThreads", "getEntities", "getNotes"].indexOf(data.type) >= 0) {
						var t = data.eventStartTime; //TODO: copy properties of each query that is needed on client side.

						delete data.eventStartTime;

						if (data.type === "getUsers" && data.results) {
							data.results = data.results.splice(0, 181);
						}

						conn.send(data);
						data.eventStartTime = t;
					}

					if (["join", "part", "admit", "expel"].indexOf(data.type) >= 0) {
						var refObject, connections, censoredAction;

						if (data.type === "join" || data.type === "part") {
							refObject = data.user;
						} else {
							refObject = data.victim;
						}

						connections = uConns[refObject.id];

						if (connections) {
							censoredAction = censorAction(data);
							connections.forEach(function(c) {
								c.send(censoredAction);
							});
						}
					}

					if (data.type === "note") {
						if (sConns[data.session]) {
							sConns[data.session].forEach(function(c) {
								c.send(data);
							});
						}
					}

					if (data.type === "upload/getPolicy") {
						log.d("sending policy back", data);

						conn.send(data);
					}
				});
			});

			socket.on("close", function() {
				handleClose(conn);
			});
		});
	}

	[ "init", "away", "back", "join", "part", "room", "user", "admit", "expel", "edit", "text" ].forEach(function(e) {
		core.on(e, emit, "gateway");
	});

	return {
		initServer: initServer
	};
};
