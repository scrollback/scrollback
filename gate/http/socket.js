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

var rConns = {}, sConns = {};

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
	var user, sid = data.sid;
	session.get(sid, function(err, sess) {
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
	});
}

function close(conn) {
	console.log("Closed a connection of ", conn.sid);
	if(!conn.sid) return;
	var user = conn.session.user;
	
	conn.rooms.forEach(function(room) {
		if(user.rooms[room]) user.rooms[room]--;
		if (!user.rooms[room]) {
			delete user.rooms[room];
			core.message({ type: 'away', from: user.id, to: room,
				time: new Date().getTime(), text: "" });
		}
	});
	
	conn.save();
}

function messages (query, conn) {
	core.messages(query, function(err, m) {
		if(err) {
			log("MESSAGES error", query, err);
			conn.send('error', err.message);
			return;
		}
		conn.send('messages', { query: query, messages: m} );
	});
}

function message (m, conn) {
	if(!conn.sid) return;
	console.log("user",conn.user);
	var user = conn.session.user;
	
	m.from = user.id;
	m.time = new Date().getTime();
	m.origin = "web://" + conn.socket.remoteAddress;
	m.to = m.to || Object.keys(user.rooms);
	
	if (m.type == 'back') {
		if(rConns[m.to]) rConns[m.to].push(conn);
		else rConns[m.to] = [conn];
		
		conn.rooms.push(m.to);
		
		if(user.rooms[m.to]) {
			user.rooms[m.to]++;
			return; // already back'd this guy.
		} else {
			user.rooms[m.to] = 1;
		}
		
		conn.save();
	} else if (m.type == 'away') {
		if(rConns[m.to]) {
			rConns[m.to].splice(rConns[m.to].indexOf(conn), 1);
		}
		
		conn.rooms.splice(conn.rooms.indexOf(m.to), 1);
		
		if(user.rooms[m.to]) user.rooms[m.to]--;
		if(user.rooms[m.to]) return; // already away'd.
		
		conn.save();
	} else if(m.type == 'nick' && m.user) {
		m.user.originalId = user.id;
		console.log("accounts",m.user.accounts,conn);
		m.user.accounts[0] = user.accounts[0];
	}
	
	core.message(m, function (err, m) {
		var i;
		console.log(err,m);
		if(m.type == 'nick') {
			if(m.user) {
				console.log(m.user);
				if (!conn.session.user) {
					conn.session.user={};
				}
				for(i in m.user) if(m.user.hasOwnProperty(i)) {
					conn.session.user[i] = m.user[i];
				}
			} else {
				conn.session.user.id = m.ref;
			}
			conn.save();
		}
		if (err) return conn.send('error', err.message,conn);
	});
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
			conn.send('error', err.message);
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

