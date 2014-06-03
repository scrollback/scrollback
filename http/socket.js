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

/* global require, module, exports, console, setTimeout */

var sockjs = require("sockjs"), core,
	// api = require("./api.js"),
	log = require("../lib/logger.js"),
	config = require("../config.js"),
	generate = require("../lib/generate.js");

var internalSession = Object.keys(config.whitelists)[0];

var rConns = {}, uConns = {}, sConns = {}, urConns = {};
var sock = sockjs.createServer();

sock.on('connection', function (socket) {
	var conn = { socket: socket };
	socket.on('data', function(d) {
		var i, l, e;
		try { d = JSON.parse(d); log ("Socket received ", d); }
		catch(e) { log("ERROR: Non-JSON data", d); return; }

		if (!d.type) return;
		
		if(d.type == 'init' && d.session) {
			if(d.session == internalSession) return;
			conn.session = d.session; // Pin the session and resource.
			conn.resource  = d.resource;
			if (!sConns[d.session]) {
				sConns[d.session] = []
				sConns[d.session].push(conn);
			} else {
				if(sConns[d.session].indexOf(conn) == -1) {
					sConns[d.session].push(conn);
				}
			}
		}
		else if (conn.session) {
			d.session = conn.session;
			d.resource  = conn.resource;
		}

		if(d.type == 'back') {
			//just need for back as storeBack will be called before actionValidator
			if(!d.to) {
				e = {type: 'error', id: d.id, message: "INVALID_ROOM"};
				conn.send(e);
				return;
			} else if(!d.from) {
				e = {type: 'error', id: d.id, message: "INVALID_USER"};
				conn.send(e);
				return;
			}
			if(!verifyBack(conn, d)){
				storeBack(conn, d);
				conn.send(d);
				return;
			}
		}
		core.emit(d.type, d, function(err, data) {
			var e;
			if(err) {
				e = {type: 'error', id: d.id, message: err.message};
				log("Sending Error: ", e);
				return conn.send(e);
			}
			if(data.type == 'back') {
				/* this is need because we dont have the connection object
				 of the user in the rconn until storeBack is called*/
				conn.send(data);
				storeBack(conn, data);
				return;
			}
			if(data.type == 'room') {
				/* this is need because we dont have the connection object in the
				rconn until the room can be setup and a back message is sent.*/
				if(!data.old || !data.old.id) conn.send(data);
				// return;
			}
			if(data.type == 'away') storeAway(conn, data);
			if(data.type == 'init') {
				if(data.old){
					data.occupantOf.forEach(function(e) {
						var role, i,l;

						for(i=0,l=data.memberOf.length;i<l;i++) {
							if(data.memberOf[i].id ==e.id) {
								role = data.memberOf[i].role;
								break;
							}
						}
						
						data.user.role = role;
						emit({id: generate.uid(), type: "away", to: e.id, from: data.old.id, user: data.old, room: e});
						emit({id: generate.uid(), type: "back",to: e.id, from: data.user.id, session: data.session,user: data.user, room: e});
					});	
				}
				storeInit(conn, data);
			}
			if(data.type == 'user') processUser(conn, data);
			if(['getUsers', 'getTexts', 'getRooms', 'getThreads'].indexOf(data.type)>=0){
				console.log(data);
				conn.send(data);
			}

			/* no need to send it back to the connection object when no error,
			 emit function will take care of that.
				conn.send(data);
			 */
		});
	});

	conn.send = function(data) {
		socket.write(JSON.stringify(data));
	};
	socket.on('close', function() { handleClose(conn); });
});

function processUser(conn, user) {
	if(/^guest-/.test(user.from)) {
		core.emit("init",  {time: new Date().getTime(), to: 'me', session: conn.session, resource: conn.resource, type: "init"});
	}
}
function storeInit(conn, init) {
	if(!uConns[init.user.id]) uConns[init.user.id] = [];
	sConns[init.session].forEach(function(c) {
		var index;
		if(init.old && init.id) {
			index = uConns[init.old.id].indexOf(c);
			uConns[init.old.id].splice(index, 1);
		}

		uConns[init.user.id].push(c);

		init.occupantOf.forEach(function(room) {
			if(init.old) {
				index = urConns[init.old.id+":"+room.id].indexOf(c);
				urConns[init.old.id+ ":"+ room.id].splice(index, 1);
			}
			if(!urConns[init.user.id+":"+room.id]) urConns[init.user.id+":"+room.id] = [];
			if(urConns[init.user.id+":"+room.id].indexOf(c)<0) urConns[init.user.id+":"+room.id].push(c);
		});
	});
}

function storeBack(conn, back) {
	if(!rConns[back.to]) rConns[back.to] = [];
	if(!sConns[back.session]) sConns[back.session] = [];
	if(!urConns[back.from+":"+back.to]) urConns[back.from+":"+back.to] = [];
	if(!uConns[back.from]) uConns[back.from] = [];
	if(rConns[back.to].indexOf(conn)<0) rConns[back.to].push(conn);
	if(urConns[back.from+":"+back.to].indexOf(conn)<0) urConns[back.from+":"+back.to].push(conn);
}


function storeAway(conn, away) {
	delete urConns[away.from+":"+away.to];
	if (sConns[away.session] && !sConns[away.session].length) {
		delete sConns[away.session];
	}
	if (uConns[away.session] && !uConns[away.session].length) {
		delete uConns[away.session];
	}
	if(urConns[away.from+":"+away.to]) delete urConns[away.from+":"+away.to];
}

exports.initServer = function (server) {
	sock.installHandlers(server, {prefix: '/socket'});
}

exports.initCore = function(c) {
    core = c;
	// api(core);
	core.on('init', emit,"gateway");
	core.on('away', emit,"gateway");
	core.on('back', emit,"gateway");
	core.on('join', emit,"gateway");
	core.on('part', emit,"gateway");
	core.on('room', emit,"gateway");
	core.on('user', emit,"gateway");
	core.on('admit', emit,"gateway");
	core.on('expel', emit,"gateway");
	core.on('edit', emit,"gateway");
	core.on('text', emit,"gateway");
};

function emit(action, callback) {
	var conns;
	log("Sending out: ", action);

	if(action.type == 'init') {		
		if(sConns[action.session]) sConns[action.session].forEach(function(conn){
			conn.user = action.user;
			dispatch(conn);
		});
	} else if(action.type == 'user') {
		uConns[action.from].forEach(dispatch);
	} else {
		if(rConns[action.to]){
			rConns[action.to].forEach(dispatch);
		}
	}
	
	function dispatch(conn) {conn.send(action); }
	if(callback) callback();
};

function handleClose(conn) {
	if(!conn.session) return;
	var connections;
	core.emit('getUsers', {ref: "me", session: conn.session}, function(err, sess) {

		if(err || !sess || !sess.results) {
			log("Couldn't find session to close.", err, sess);
			return;
		}
		var user = sess.results[0];
		setTimeout(function() {
			core.emit('getRooms', {hasOccupant: user.id, session: conn.session}, function(err, rooms) {
				if(err || !rooms ||!rooms.results) {
					log("couldnt find his rooms: away message not sent:", err, rooms);
					return;
				}

				rooms.results.forEach(function(room) {
					var awayAction = {
						from: user.id,
						session: conn.session,
						type:"away",
						to: room.id,
						time: new Date().getTime()
					};
					
					if(!verifyAway(conn, awayAction)) return;
					core.emit('away',awayAction , function(err, action) {
						if(err) return;
						storeAway(conn, action)
					});
				});
			});
		}, 3*1000);
	});
}

function verifyAway(conn, away) {
	var index;
	if(rConns[away.to]) {
		index = rConns[away.to].indexOf(conn);
		rConns[away.to].splice(index,1);
	}
	if(sConns[conn.session]) {
		index = sConns[conn.session].indexOf(conn);
		sConns[conn.session].splice(index,1);
	}
	if(uConns[away.from]) {
		index = uConns[away.from].indexOf(conn);
		uConns[away.from].splice(index,1);
	}
	if(urConns[away.from+":"+away.to]) {
		index = urConns[away.from+":"+away.to].indexOf(conn);
		urConns[away.from+":"+away.to].splice(index,1);
		return (urConns[away.from+":"+away.to].length==0);
	}else{
		return true;
	}
}

function verifyBack(conn, back) {
	if(!urConns[back.from+":"+back.to]) return true;
	return (urConns[back.from+":"+back.to].length===0);
}
