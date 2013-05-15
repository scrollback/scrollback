/*
	Websockets gateway
	
	Use node-fibers to syncify async things.
*/
var io = require("socket.io"),
	core = require("../../core/core.js");


exports.init = function (server) {
	io = io.listen(server);
	io.set('log level', 1);
	
	io.sockets.on('connection', function (socket) {
		socket.on('join', incoming.join);
		socket.on('postIn', incoming.post);
		socket.on('disconnect', incoming.part);
		socket.on('persist', incoming.persist);
	});
};

exports.post = postOut;

function postOut(post, rooms) {
	var i, l, text = sanitize(post.text);
	for(i=0, l = rooms.length; i<l; i++) {
		io.sockets.in(rooms[i]).emit('post', post);
	}
}

function postIn(text) {
	var socket = this,
		room = socket.get('room'),
		user = session.get(socket.manager.cookie['connect.sid']).user;
	core.post({type: 'text', to: room, from: user, text: text}).save();
}

function joinIn(room) {
	var socket = this,
		user = session.get(socket.manager.cookie['connect.sid']).user;
		
	socket.join(room);
	socket.set('room', room);
	core.post({type: 'join', to: room, from: user}).save();
}

function disconnectIn() {
	var socket = this,
		room = socket.get('room'),
		user = session.get(socket.manager.cookie['connect.sid']).user;
	
	core.post({type: 'part', to: room, from: user}).save();
}