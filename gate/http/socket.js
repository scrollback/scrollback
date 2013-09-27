/*
	Websockets gateway
	
	Use node-fibers to syncify async things.
*/

"use strict";

var sockjs = require("sockjs"),
	core = require("../../core/core.js"),
	cookie = require("cookie"),
	log = require("../../lib/logger.js"),
	config = require("../../config.js"),
	EventEmitter = require("events").EventEmitter,
	session = require("./session.js"),
	guid = require("../../lib/guid.js");

var rConns = {}, users = {};

var sock = sockjs.createServer();

sock.on('connection', function (socket) {
	var conn = { socket: socket };
	
	socket.on('data', function(d) {
		try { d = JSON.parse(d); log ("Socket received ", d); }
		catch(e) { log("ERROR: Non-JSON data", d); return; }
		
		switch(d.type) {
			case 'init': init(d.data, conn); break;
			case 'message': message(d.data, conn); break;
			case 'messages': messages(d.data, conn); break;
			case 'room': room(d.data, conn); break;
			case 'rooms': rooms(d.data, conn); break;
		}
	});
	
	conn.send = function(type, data) {
		socket.write(JSON.stringify({type: type, data: data}));
	};
	
	socket.on('close', function() { close(conn); });
});

exports.init = function (server) {
	sock.installHandlers(server, {prefix: '/socket'});
};

function init(data, conn) {
	var user, sid = data.sid, nick = data.nick;
	
	session.get({sid:sid, suggestedNick:data.nick}, function(err, sess) {
		console.log("RETRIEVED SESSION", sess);
		conn.sid = sid;
		conn.rooms = [];
		conn.session = sess;
		conn.save = function() { session.set(conn.sid, conn.session); };
		conn.send('init', {
			sid: sess.cookie.value, user: sess.user,
			clientTime: data.clientTime,
			serverTime: new Date().getTime()
		});

		conn.save();
	});

	session.watch({sid: sid, cid: conn.socket.id}, function(sess) {
		log("The session has changed", sid, conn.socket.id,sess);
		conn.session = sess;
	});
}

function close(conn) {
	if(!conn.sid) return;
	var user = conn.session.user;
	
	conn.rooms.forEach(function(room) {
		log("Closed connection, removing", user.id, room);
		userAway(user, room, conn);
	});

	conn.save();
}

function userAway(user, room, conn) {
	if(rConns[room]) rConns[room].splice(rConns[room].indexOf(conn), 1);
	conn.rooms.splice(conn.rooms.indexOf(room), 1);	
	conn.save();
	setTimeout(function() {
		var user = conn.session.user;
		if (!(user.rooms[room]-1)) {
			delete user.rooms[room];
			core.message({ type: 'away', from: user.id, to: room,
				time: new Date().getTime(), text: "" , origin : {gateway : "web", location : "", ip :  conn.socket.remoteAddress}});
			if(!Object.keys(user.rooms).length) {
				delete users[user.id];
			}
			console.log("saving the session ",user);
			conn.save();
		}
		else{
			user.rooms[room]--;
			conn.save();
			log("User still has some active windows.",user);
		}
		session.unwatch({sid: conn.sid, cid: conn.socket.id});
	}, 30*1000);
	return false; // never send an away message immediately. Wait.
}

function userBack(user, room, conn) {
	if(rConns[room]) rConns[room].push(conn);
	else rConns[room] = [conn];
	conn.rooms.push(room);
	
	users[user.id] = user;

	if(user.rooms[room]) {
		user.rooms[room]++;
		conn.save();
		return false; // we've already sent a back message for this user for this room.
	}
	user.rooms[room] = 1;
	conn.save();
	return true;
}

function messages (query, conn) {
	core.messages(query, function(err, m) {
		if(err) {
			log("MESSAGES error", query, err);
			conn.send('error', err);
			return;
		}
		conn.send('messages', { query: query, messages: m} );
	});
}

function message (m, conn) {
	if(!conn.sid) return;
	var user = conn.session.user;
	
	m.from = user.id;
	m.time = new Date().getTime();

	m.origin.ip = conn.socket.remoteAddress;
	m.to = m.to || Object.keys(user.rooms);
	
	if(typeof m.to != "string" && m.to.length==0)
		return;


	if (m.type == 'back') {
		if(!userBack(user, m.to, conn)) return; 
		// it returns false if the back message for this user is already sent
	} else if (m.type == 'away') {
		if(!userAway(user, m.to, conn)) return; 
		// it returns false if the away message for this user is not to be sent yet
	} else if(m.type == 'nick') {
		console.log("checking dup nick",m.from,m.type);
		if(m.ref && users[m.ref] )
			return conn.send('error', {id: m.id, message: "DUP_NICK"});
		if(m.user){
			m.user.originalId = user.id;
			if (!m.user.originalId.match(/^guest/)) {
				log("user cannot change the nick.");
				return;
			}
			m.user.accounts[0] = user.accounts[0];	
		}
	}
	

	function sendMessage() {
		console.log("core.message",m);
		core.message(m, function (err, m) {
			var i;
			if(m.type == 'nick') {
				if(m.user) {
					console.log("m.user is", m.user);
					if (!conn.session.user) {
						console.log("No session user?");
						// conn.session.user={};
					}
					for(i in m.user) if(m.user.hasOwnProperty(i)) {
						conn.session.user[i] = m.user[i];
					}
				} else {
					conn.session.user.id = m.ref;
				}
				conn.save();
				console.log("Saved session", conn.session);
			}
			
			if (err) {
				return conn.send('error', {id: m.id, message: err.message});
			}
			if(m.ref) {
				users[m.ref] = users[user.from] || {};
				users[m.from] && delete users[m.from];
				if(m.ref.indexOf("guest-") != 0) {
					users["guest-"+m.from]=users[user.from];
				}
			}
		});
	}
	if(m.type=="nick" && m.ref) {
		core.room(((m.ref.indexOf("guest-")==0)? m.ref.substring(6) : m.ref),function(err,data){
			if(err) return conn.send('error', {id: m.id, message: err.message});
			if(data.length>0) return conn.send('error', {id: m.id, message: "DUP_NICK"});
			sendMessage();
		});
	} else {
		sendMessage();
	}
}

function room (r, conn) {
	var user;
	
	if(!conn.sid) return;
	if(typeof r === 'object') {
		user = conn.session.user;
		r.owner = user.id;
	}
	core.room(r, function(err, data) {
	});
}

function rooms(query, conn) {
	core.rooms(query, function(err, data) {
		if(err) {
			log("ROOMS ERROR", query, err);
			conn.send('error', err);
			return;
		}
		conn.send('rooms', data);
	});
}

// ----- Outgoing send ----

exports.send = function (message, rooms) {
	message.text = message.text || "";
	log("Socket sending", message, "to", rooms);
	rooms.map(function(room) {
		if(rConns[room]) rConns[room].map(function(conn) {
			conn.send('message', message);
		});
	});
};

