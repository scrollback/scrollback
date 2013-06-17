/*
	Websockets gateway
	
	Use node-fibers to syncify async things.
*/
var io = require("socket.io"),
	core = require("../../core/core.js"),
	cookie = require("cookie");
	
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
		socket.on('nick', function(n) {
			user.id = n;
			core.send({type: "nick", ref: 'nick'});
		});
		
		socket.on('peek', function(room) {
			console.log("Received PEEK via socket: ", room);
			socket.join(room);
		});
		
		socket.on('message', function (message) {
			message.from = user.id;
			message.time = new Date().getTime();
			console.log("Received message via socket: ", message);
			if(message.type === 'part'){
				socket.leave(message.to);
			}
			core.send(message);
		});
		
		socket.on('get', function(query) {
			console.log("Received GET via socket: ", query.to);
			core.messages(query, function(data) {
				var i, l=data.length;
				console.log("Response length ", data.length);
				for(i=0; i<l; i+=1) socket.emit('message', data[i]);
			});
		});
		
		socket.on('disconnect', function() {
			var i, rooms = [], room;
			console.log("Beginning 1 minute wait:", rooms);
			
			for(room in io.sockets.manager.roomClients[socket.id]) {
				rooms.push(room.substr(1));
			}
			
			user.discoWait = setTimeout(function() {
				console.log("1 minute elapsed. Disconnecting.", rooms);
				rooms.map(function(room) {
					core.send({ type: 'part', from: user.id, to: room,
						time: new Date().getTime(), text: "" });
				});
			}, 60000);
		});
		
		socket.on('time', function(requestTime) {
			socket.emit('time', {
				server: new Date().getTime(), request: requestTime
			});
		});
		
		if(user.discoWait) clearTimeout(user.discoWait);
	});
};

exports.send = function (message, rooms) {
	message.text = sanitize(message.text || "");
	console.log("Socket sending", message, "to", rooms);
	rooms.map(function(room) {
		io.sockets.in(room).emit('message', message);
	});
}

function sanitize(text) {
	return text.replace(/\</g, '&lt;');
}