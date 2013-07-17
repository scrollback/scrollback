/*
	Websockets gateway
	
	Use node-fibers to syncify async things.
*/
"use strict";

var io = require("socket.io"),
	core = require("../../core/core.js"),
	cookie = require("cookie"),
	log = require("../../lib/logger.js"),
	config = require("../../config.js"),
	RateLimiter = require('limiter').RateLimiter;

var users = {}, uIndex = {};

exports.init = function (server) {
	io = io.listen(server);
	io.set('log level', 1);

	io.sockets.on('connection', function (socket) {
		var limiter = new RateLimiter(config.http.limit, config.http.time, true);
		var sid = cookie.parse(socket.handshake.headers.cookie || '')['connect.sid'],
			user = sid && users[sid];
		
		if(!user) {
			user = {
				id: 'sb' + Math.floor(Math.random() * 10000),
				rooms: {}
			};
			if (sid) {
				users[sid] = user;
				uIndex[user.id] = sid;
			}
		}
		
		log("New connection", sid, user.id);
		
		socket.emit('message', {type: 'nick', from: '', to: '', ref: user.id});
		
		socket.on('message', function (message) {
			limiter.removeTokens(1, function(err, remaining) {
				var room;
				if (remaining < 0) {
					log("Error: API Limit exceeded.");
					socket.emit('error', 'API Limit exceeded.');
					return;
				}
				log("API Limit remaining:", remaining);
				
				message.from = user.id;
				message.time = new Date().getTime();
				message.origin = "web://" + socket.handshake.address.address;
				
				if (message.type == 'back') {
					socket.join(message.to);
					if(user.rooms[message.to]) {
						user.rooms[message.to]++;
						return;
					} else {
						user.rooms[message.to] = 1;
					}
				} else if (message.type == 'away') {
					if(user.rooms[message.to]) user.rooms[message.to]--;
					if(!user.rooms[message.to]) return;
				} else if (message.type == 'nick') {
					log("nick "+user.id + " to " + message.ref + ", forwarding");
					for (room in user.rooms) {
						if (user.rooms[room]) {
							message.to = room;
							core.message(message);
						}
					}
					user.id = message.ref;
					return;
				}
				
				log("Received message via socket: ", message);
				if(message.type === 'part') {
					socket.leave(message.to);
				}
				core.message(message);
			});
		});
		
		socket.on('messages', function(query) {
			log("Received GET via socket: ", query.to);
			core.messages(query, function(m) {
				log("Response length ", m.length);
				socket.emit('messages', { query: query, messages: m} );
			});
		});
		
		socket.on('disconnect', function() {
			var rooms = [], room;
			log("Socket disconnected; Sending away:", rooms);
			
			for(room in io.sockets.manager.roomClients[socket.id]) {
				// User.rooms is the count of how many tabs, in the
				// same browser, the room is open in.
				if (!room) return;
				room = room.replace('/', ''); // There is a leading '/'.
					
				if(user.rooms[room]) user.rooms[room]--;
				if (!user.rooms[room]) {
					delete user.rooms[room];
					core.message({ type: 'away', from: user.id, to: room,
						time: new Date().getTime(), text: "" });
				}
				if (Object.keys(user.rooms).length === 0) {
					delete users[sid];
					delete uIndex[user.id];
				}
			}
		});
		
		socket.on('time', function(requestTime) {
			socket.emit('time', {
				server: new Date().getTime(), request: requestTime
			});
		});
	});
};

exports.send = function (message, rooms) {
	message.text = sanitize(message.text || "");
	rooms.map(function(room) {
		log("Socket sending", message, "to", room);
		io.sockets['in'](room).emit('message', message);
	});
	
	if (message.type == 'nick') {
		if(uIndex[message.from]) {
			users[uIndex[message.from]].id = message.ref;
		}
	}
};

function sanitize(text) {
	return text.replace(/\</g, '&lt;');
}