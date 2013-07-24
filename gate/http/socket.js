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
	RateLimiter = require('limiter').RateLimiter,
	gateways=core.gateways;

var users = {}, uIndex = {}, uWait = {};

exports.init = function (server) {
	io = io.listen(server);
	io.set('log level', 1);

	io.sockets.on('connection', function (socket) {
		var limiter = new RateLimiter(config.http.limit, config.http.time, true);
		var sid = cookie.parse(socket.handshake.headers.cookie || '')['connect.sid'],
		user = sid && users[sid];
		if(!user) {
			users[sid] = user = {
				id: 'guest-sb' + Math.floor(Math.random() * 10000),
				rooms: {}
			};
			if (sid) {
				if (uWait[sid]) {
					clearTimeout(uWait[sid]);
					delete uWait[sid];
				}
				users[sid] = user;
				uIndex[user.id] = sid;
			}
		}
		
		log("New connection", sid, user.id);
		
		socket.emit('message', {type: 'nick', from: '', to: '', ref: user.id});
		
		console.log(user);
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
					socket.leave(message.to);
					if(user.rooms[message.to]) user.rooms[message.to]--;
					if(user.rooms[message.to]) return;
				} else if (message.type == 'nick') {
					log("nick "+user.id + " to " + message.ref + ", forwarding");
					
					if(message.auth) {
						core.message(message,function(status,response) {
							if (status==false) {
								console.log(response.err);
								socket.emit(response.err);
							}
							else {
								console.log("old user");
								core.room.room(response[0].room,function(err,room) {
									var i;
									console.log(message);
									socket.emit('message', {type: 'nick', from: message.from, to: '', ref: room[0].name});
								});
							}
						});
						return;
					}
					
					for (room in user.rooms) {
						if (user.rooms[room]) {
							message.to = room;
							core.message(message,function(status,response) {
							});
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
			}
			if (!Object.keys(user.rooms).length && sid) {
				uWait[sid] = setTimeout(function () {
					log("1 hour elapsed. Deleting session:", sid, user.id);
					delete uWait[sid];
					delete uIndex[user.id];
					delete users[sid];
				}, 3600000);
			}
		});
		
		socket.on('time', function(requestTime) {
			socket.emit('time', {
				server: new Date().getTime(), request: requestTime
			});
		});
		
		socket.on("update",function(request){

			console.log("receiving update");
			if (request.type==="account") {
				core.account.account(request.params);
			}
			else if (request.type==="room") {
				
				
				var sid = cookie.parse(socket.handshake.headers.cookie || '')['connect.sid'],
				user = users[sid];
				core.room.room(request.params);
				var message={
					type: 'nick',
					from: user.id,
					to: '',
					ref: request.params.name
				};

				//socket.emit('message', );
			}
		});
	});
};

exports.send = function (message, rooms) {
	message.text = sanitize(message.text || "");
	rooms.map(function(room) {
		log("Socket sending", message, "to", room);
		console.log("----harry------");
		console.log(message);
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