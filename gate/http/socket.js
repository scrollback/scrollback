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

exports.init = function (server) {
	var sock = sockjs.createServer();

	sock.on('connection', function (socket) {
		var conn = { socket: socket };
		console.log("new connection", conn);
		
		socket.on('data', function(d) {
			log ("Socket received ", d);
			try { d = JSON.parse(d); }
			catch(e) { log("ERROR: Non-JSON data", d); return; }
			
			switch(d.type) {
				case 'init': init(d.data, conn); break;
				case 'message': message(d.data, conn); break;
				case 'messages': messages(d.data, conn); break;
				case 'room': room(d.data, conn); break;
			}
		});
		
		conn.send = function(type, data) {
			socket.write(JSON.stringify({type: type, data: data}));
		};
		
		socket.on('close', function() { close(conn); });
	});
	
	sock.installHandlers(server, {prefix: '/socket'});
};

function init(data, conn) {
	var user, sid = data.sid;
	if(!sid) sid = guid();
	conn.sid = sid; conn.rooms = [];
	session.get(sid, function(err, sess) {
		conn.session = sess;
		conn.save = function() { session.set(conn.sid, conn.session); };
		conn.send('init', {
			sid: sid, user: sess.user,
			serverTime: new Date().getTime()
		});
	});
}

function close(conn) {
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
	log("Received GET via socket: ", query.to);
	core.messages(query, function(m) {
		log("Response length ", m.length);
		conn.send('messages', { query: query, messages: m} );
	});
}

function message (m, conn) {
	if(!conn.sid) return;
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
	}
	
	log("Received message via socket: ", m);
	
	core.message(m, function (err) {
		if (err) conn.send('error', err);
	});
}

function room (r, conn) {
	if(!conn.sid) return;
	var user = conn.session.user;
	if(typeof r === 'object') r.owner = user.id;
	core.room(r);
}

exports.send = function (message, rooms) {
	message.text = message.text || "";
	rooms.map(function(room) {
		log("Socket sending", message, "to", room);
		if(rConns[room]) rConns[room].map(function(conn) {
			conn.send('message', message);
		});
	});
};

