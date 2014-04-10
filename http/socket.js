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
	config = require("../config.js");


var rConns = {}, uConns = {}, sConns = {}, urConns = {};
var sock = sockjs.createServer();

sock.on('connection', function (socket) {
	var conn = { socket: socket };
	socket.on('data', function(d) {
		try { d = JSON.parse(d); log ("Socket received ", d); }
		catch(e) { log("ERROR: Non-JSON data", d); return; }
		
		if(d.type == 'init' && d.session) conn.session = d.session;
		else if(conn.session) { d.session = conn.session; }
		
		if(d.type == 'back' && !verifyBack(conn, d)) return;
		if(d.type == 'away' && !verifyAway(conn, d)) return;
		
		core.emit(d.type, d, function(err, data) {
			log(arguments);
			if(data.type == 'back' && !err) storeBack(conn, d);
			if(data.type == 'away' && !err) storeAway(conn, d); 
			if(data.type == 'init' && !err) storeInit(conn, d); 
			conn.send(err? {type: 'error', ref: d.id, message: err.message}: data);
		});
	});
	
	conn.send = function(data) {
		socket.write(JSON.stringify(data));
	};
	socket.on('close', function() { handleClose(conn); });
});

function storeInit(conn, init) {
	if(!uConns[init.user.id]) uConns[init.user.id] = [];
	sConns[init.session].forEach(function(c) {
		var index = uConns[init.old.id].indexOf(c);
		uConns.splice(index, 1);
		uConns[init.user.id].push(c);
		init.occupantOf.forEach(function(room) {
			index = urConns[init.old.id+":"+room].indexOf(conn);
			urConns.splice(index, 1);
			if(!urConns[init.user.id+":"+room]) urConns[init.user.id+":"+room] = [];
			urConns[init.user.id+":"+room].push(conn);
		});
	});
}

function storeBack(conn, back) {
	/*Nothing as of now.*/
}


function storeAway(conn, away) {
	delete urConns[away.from+":"+action.to];
	if (!sConns[away.session].length) {
		delete sConns[action.session];
	}
	if (!uConns[away.session].length) {
		delete uConns[away.session];
	}
	if(urConns[away.from+":"+away.to]) delete urConns[away.from+":"+away.to];
}

module.exports = function(server, c) {
    core = c;
	// api(core);
	core.on('init', emit);
	core.on('away', emit);
	core.on('back', emit);
	core.on('join', emit);
	core.on('part', emit);
	core.on('room', emit);
	core.on('user', emit);
	core.on('admit', emit);
	core.on('expel', emit);
	core.on('edit', emit);
	core.on('text', emit);
    sock.installHandlers(server, {prefix: '/socket'});
};

function emit(action) {
	if(action.type == 'init') {
		sConns[action.session].forEach(dispatch);
	} else if(action.type == 'user') {
		uConns[action.from].forEach(dispatch);
	} else {
		rConns[action.to].forEach(dispatch);
	}
	function dispatch(conn) { conn.send(action); }
}

function handleClose(conn) {
	if(!conn.session) return;
	var connections;
	core.emit('getSessions', {ref: conn.session}, function(err, sess) {
		if(err || !sess.length) {
			log("Couldn't find session to close.");
			return;
		}
		var user = sess[0].user;
		setTimeout(function() {
			var awayAction = {
				from: user.id,
				session: conn.session,
				type:"away",
				to: conn.room,
				time: new Date().getTime()
			};
			if(verifyAway(conn, awayAction)) return;
			core.emit('away',awayAction , function(err, action) {
				if(err) return;
				storeAway(conn, action);
			});
		}, 30*1000);
	});
}
function verifyAway(conn, away) {
	var index;	

	if(rConns[conn.room]) {
		index = rConns[conn.room].indexOf(conn);
		rConns[conn.room].splice(index,1);
	}
	if(sConns[conn.session]) {
		index = sConns[conn.session].indexOf(conn);
		sConns[conn.session].splice(index,1);
	}
	if(uConns[away.from]) {
		index = uConns[away.from].indexOf(conn);
		uConns[away.from].splice(index,1);
	}
	if(urConns[away.from+":"+conn.room]) {
		index = urConns[away.from+":"+conn.room].indexOf(conn);
		urConns[away.from+":"+conn.room].splice(index,1);
		return (urConns[away.from+":"+conn.room].length === 0);
	}else{
		return true;
	}
}

function verifyBack(conn, back) {
	conn.room = back.to;
	if(!rConns[back.to]) rConns[back.to] = [];
	if(!sConns[back.session]) sConns[back.session] = [];
	if(!urConns[back.from+":"+back.to]) urConns[back.from+":"+back.to] = [];
	if(!uConns[back.from]) uConns[back.from] = [];
	rConns[back.to].push(conn);
	sConns[back.session].push(conn);
	urConns[back.from+":"+back.to].push(conn);
	uConns[back.from].push(conn);
	return (urConns[back.from+":"+back.to].length===1);
}

// function messages (query, conn) {
// 	core.emit("messages", query, function(err, m) {
// 		if(err) {
// 			log("MESSAGES error", query, err);
// 			conn.send('error', err);
// 			return;
// 		}
// 		conn.send('messages', { query: query, messages: m} );
// 	});
// }


// function edit(action, conn) {
// 	session.get({session: conn.session}, function(err, sess) {
// 		var user = sess.user;
// 		action.from = user.id;
// 		action.session = "web:"+conn.socket.remoteAddress+":"+conn.session;
// 		core.emit("edit",action, function(err, data){
// 		});
// 	});
	
// }
// function message (m, conn) {
	
// 	if(!conn.session) return;
// 	session.get({session: conn.session}, function(err, sess) {
// 		var user = sess.user, tryingNick, roomName;
// 		roomName = m.to;

// 		m.from = user.id;
// 		m.time = new Date().getTime();
// 		m.session = "web:"+conn.socket.remoteAddress+":"+ conn.sid;

// 		if (m.origin) m.origin.ip = conn.socket.remoteAddress;
// 		else{
// 			m.origin = {gateway: "web", ip: conn.socket.remoteAddress, location:"unknown"};
// 		}
// 		if(!m.to && Object.keys(user.rooms).length !== 0) {
// 			m.to = m.to || Object.keys(user.rooms);
// 		}

// 		if(m.to && typeof m.to != "string" && m.to.length===0) return;

// 		if (m.type == 'back') {
// 			if(!userBack(user, m.to, conn)) {
// 				session.set(conn.sid, sess);
// 				return; 
// 			}
// 			session.set(conn.sid, sess);
// 			// it returns false if the back message for this user is already sent
// 		} else if (m.type == 'away') {
// 			if(!userAway(user, m.to, conn)) {
// 				session.set(conn.sid, sess);
// 				return; 
// 			}
// 			// it returns false if the away message for this user is not to be sent yet
// 		} else if(m.type == 'nick') {
// 			//validating nick name on server side 
// 			if(m.ref && m.ref !== "guest-" && !validateNick(m.ref.substring(6))) {
// 				return conn.send('error', {id:m.id , message: "INVALID_NAME"});
// 			}
// 			if(m.ref && users[m.ref] )
// 				return conn.send('error', {id: m.id, message: "DUP_NICK"});
// 			if(m.user){
// 				if(!m.user.id) return conn.send("error", {id: m.id, message: "INVALID_NAME"} );
// 				m.user.originalId = user.id;
// 				if (!m.user.originalId.match(/^guest/)) {
// 					log("user cannot change the nick.");
// 					return;
// 				}
// 				if(!m.user.accounts){m.user.accounts=[];}
// 				m.user.accounts[0] = user.accounts[0];
// 			}
// 		}
		
// 		function sendMessage() {
// 			core.emit("message", m, function (err, m) {
// 				var i, user = sess.user;
// 				if(err && err.message == "GUEST_CANNOT_HAVE_MEMBERSHIP"){
// 					return conn.send('error', {id: m.id, message: err.message});
// 				}
// 				//for audience mismatch error.
// 				if(err && err.message && err.message.indexOf("AUTH_FAIL")>0) {
// 					return conn.send('error', {id: m.id, message: err.message});
// 				}
// 				if (!user || !user.id) {
// 					return;
// 				}
// 				if(m.type == 'join'){
// 					//check for user login as well
// 					sess.user.membership.push(roomName);
// 					session.set(conn.sid, sess);
// 				}
// 				if(m.type == 'part'){
// 					//check for user login as well
// 					sess.user.membership.splice(sess.user.membership.indexOf(roomName),1);
// 					session.set(conn.sid, sess);
// 				}
// 				if(m && m.type && m.type == 'nick') {

// 					//in case of logout.
// 					if(/^guest-/.test(m.ref) && !/^guest-/.test(m.from)){
// 						sess.user.id = m.ref;
// 						sess.user.picture = "//s.gravatar.com/avatar/" + crypto.createHash('md5').update(sess.user.id).digest('hex') + "/?d=identicon&s=48";
// 						sess.user.accounts = [];
// 						sess.user.membership = [];
// 						session.set(conn.sid, sess);
// 						conn.send('init', {
// 							sid: sess.cookie.value,
// 							user: sess.user
// 						});
// 						if(/^guest-/.test(m.ref)){
// 							core.emit("init",{
// 								type:"init", 
// 								from:m.ref, 
// 								time: new Date().getTime()
// 							});	
// 						}
// 					}

// 					if(m.user) {
// 						/*	why shallow copy? why not sess.user = m.user?
// 							copying the property like accounts to the session, but the user will not send other properties.
// 						*/
// 						for(i in m.user) if(m.user.hasOwnProperty(i)) {
// 							user[i] = m.user[i];
// 						}
// 					} else if(!err){
// 						user.id = m.ref;
// 					}
// 					session.set(conn.sid, sess);
// 					var query=[];
// 					if (sess.user.id.indexOf('guest-')!==0) {
// 						query.user=sess.user.id;
// 					}
// 					core.emit("members", query,function(err,d){
// 						var m={};
// 						if (d) {
// 							for (i=0;i<d.length;i++) {
// 								m[d[i].room]=true;
// 							}
// 						}
// 						sess.user.membership = Object.keys(m);
// 						if(!err){
// 							conn.send('init', {
// 								sid: sess.cookie.value,
// 								user: sess.user
// 							});
// 						}
// 						session.set(conn.sid, sess);
// 					});
// 					if(m.ref) {
// 						users[m.ref] = users[user.from] || {};
// 						if(users[m.from]) delete users[m.from];
// 						if(m.ref.indexOf("guest-") !== 0) {
// 							users["guest-"+m.from]=users[user.from];
// 						}
// 					}
// 				}

// 				/* 
// 					Why this is not at the top?
// 					this thing should be at the bottom because we need the error AUTH_UNREGISTERED to be handled properly before sending the response.
// 				 */
// 				if (err) {
// 					return conn.send('error', {id: m.id, message: err.message});
// 				}
// 			});
// 		}
		
// 		if(m.type=="nick" && m.ref!="guest-" &&( m.ref || m.user)) {
// 			tryingNick = m.ref || m.user.id;
// 			core.emit("rooms",{id:tryingNick.replace(/^guest-/,"")},function(err,data){
// 				if(err) return conn.send('error', {id: m.id, message: err.message});
// 				if((data.length>0) || data.id) return conn.send('error', {id: m.id, message: "DUP_NICK"});
// 				sendMessage();
// 			});
// 		} else {
// 			sendMessage();
// 		}
// 	});
// }


	// function room (r, conn) {
	// 	var user;
	// 	session.get({sid: conn.sid}, function(err, sess) {
	// 		if(!conn.sid) return;
	// 		if(typeof r === 'object') {
	// 			user = sess.user;
	// 			r.owner = user.id;
	// 		}
	// 		core.emit("room", r, function(err, data) {
	// 			if(err) {
	// 				log("ROOM ERROR", r, err);
	// 				r= {
	//   					queryId : r.queryId
	//   				};
	// 				r.message = err.message;
	//  				conn.send('error', r);
	// 			}else{
	// 				data.query= {
	// 					queryId : r.queryId
	// 				};
	// 				conn.send('room', data);
	// 			}
	// 		});
	// 		session.set(conn.sid, sess);
	// 	});
	// }


	// function getRooms(query, conn) {
	// 	core.emit("getRooms", query, function(err, data) {
	// 		if(err) {
	// 			query.message = err.message;
	// 			conn.send('error',query);
	// 			return;
	// 		}else {
	// 			log(data);
	// 			conn.send('getRooms', { query: query, data: data} );
	// 			//conn.send('rooms', data);	
	// 		}
	// 	});
	// }


	// function getUsers(query, conn) {
	// 	core.emit("getUsers", query, function(err, data) {
	// 		if(err) {
	// 			query.message = err.message;
	// 			conn.send('error',query);
	// 			return;
	// 		}else {
	// 			log(data);
	// 			conn.send('getUsers', { query: query, data: data} );
	// 			//conn.send('rooms', data);	
	// 		}
	// 	});
	// }
	// function rooms(query, conn) {
	// 	core.emit("rooms", query, function(err, data) {
	// 		if(err) {
	// 			log("ROOMS ERROR", query, err);
	// 			query.message = err.message;
	// 			conn.send('error',query);
	// 			return;
	// 		}else {
	// 			log(data);
	// 			conn.send('rooms', { query: query, data: data} );
	// 			//conn.send('rooms', data);	
	// 		}
	// 	});
	// }

	// function validateNick(nick){
	// 	if (nick.indexOf("guest-")===0) return false;
	// 	return (nick.match(/^[a-z][a-z0-9\_\-\(\)]{2,32}$/i)?nick!='img'&&nick!='css'&&nick!='sdk':false);
	// }

	// // ----- Outgoing send ----

	// exports.send = function (message, rooms) {
	// 	message.text = message.text || "";
	// 	log("Socket sending", message, "to", rooms);
		
	// 	rooms.map(function(room) {
	// 		var location, to = message.to;
	// 		if(message.origin) {
	// 			location= message.origin;
	// 			delete message.origin;
	// 		}
	// 		//if(message.type == "text") core.occupants(message.to, function(err, data){console.log(err, data);});
	// 		if(rConns[room]) rConns[room].map(function(conn) {
	// 			message.to = room;
	// 			conn.send('message', message);
	// 		});
	// 		if(location) message.origin = location;
	// 		message.to = to;
	// 	});
	// };


	// exports.emit = function(type, action, room) {
	// 	if(rConns[room]) rConns[room].map(function(conn) {
	// 		action.to = room;
	// 		conn.send(type, action);
	// 	});		
	// };
