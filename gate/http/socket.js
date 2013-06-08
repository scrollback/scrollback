/*
	Websockets gateway
	
	Use node-fibers to syncify async things.
*/
var io = require("socket.io"),
	core = require("../../core/core.js"),
	cookie = require("cookie"),
	isEcho = require("../../lib/isecho.js");
	
var users = {};

exports.init = function (server) {
	io = io.listen(server);
	io.set('log level', 1);
	
	io.sockets.on('connection', function (socket) {
		var sid = cookie.parse(socket.handshake.headers.cookie || '')['connect.sid'],
			user = users[sid];
			
		if(!user) {
			users[sid] = user = {
				id: 'guest-' + Math.floor(Math.random() * 10000)
			}
		}
		
		socket.emit('nick', user.id);
		socket.on('nick', function(n) { user.id = n; });
		
		socket.on('message', function (message) {
			console.log("Received message via socket: ", message);
			message.from = user.id;
			message.time = new Date().getTime();
			if(message.type == 'join') {
				socket.join(message.to);
			} else {
				if(isEcho("http", message)) return;
			}
			core.send(message);
		});
		
		socket.on('get', function(query) {
			console.log("Received GET via socket: ", query);
			core.read(query, function(data) {
				var i, l=data.length;
				console.log("Response: ", data);
				for(i=0; i<l; i++) socket.emit('message', data[i]);
			});
		});
		
		socket.on('disconnect', function() {
			var i, rooms = io.sockets.manager.roomClients[socket.id];
			console.log("Beginning 1 minute wait:", rooms);
			
			user.discoWait = setTimeout(function() {
				var room;
				console.log("1 minute elapsed. Disconnecting.");
				for(room in rooms) if(rooms.hasOwnProperty(room)) {
					room = room.substr(1); // Socket.io adds a leading `/`
					core.send({ type: 'part', from: user.id, to: room,
						time: new Date().getTime() });
				}
			}, 60000);
		});
		
		if(user.discoWait) clearTimeout(user.discoWait);
	});
};

exports.send = function (message, rooms) {
	message.text = sanitize(message.text || "");
	message.time = new Date().getTime();
	if(isEcho('http', message)) return;
	rooms.map(function(room) {
		io.sockets.in(room).emit('message', message);
	});
}

function sanitize(text) {
	return text.replace(/\</g, '&lt;');
}