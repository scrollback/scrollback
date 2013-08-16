/*
 * This is version 2 of  the client side scrollback SDK.
 *
 * @author Aravind
 * copyright (c) 2012 Askabt Pte Ltd
 *
 *
 * Dependencies:
 *   - addEvent.js
 *   - domReady.js
 *   - getByClass.js
 *   - jsonml2.js
 *
 *   test changes...
 */

"use strict";
var socket = io.connect(scrollback.host);
var timeAdjustment = 0;
var rooms = {}, requests = {}, lastPos;
var core = Object.create(emitter);
var nick = "";

socket.on('connect', function() {
	/* global scrollback, io, EventEmitter */
	if(scrollback.streams && scrollback.streams.length) {
		scrollback.streams.forEach(function(id) {
			if(!id) return;
			core.enter(id);
		});
	}
	core.emit('connected');
	if (nick !== '') core.nick(nick);
});

socket.on('disconnect', function() {
	var id;
	for(id in rooms) if(rooms.hasOwnProperty(id)) core.leave(id);
	core.emit("disconnected");
});

core.enter = function (id) {
	if(!rooms[id]) rooms[id] = { messages: messageArray() };
	message('result-start', id);
	message('back', id);
	core.emit('enter', id);
};

core.leave = function (id) {
	message('away', id);
	message('result-end', id);
	core.emit('leave', id);
//	delete rooms[id];
};

function guid() {
    var str="", i;
	for(i=0; i<32; i++) str += (Math.random()*16|0).toString(16);
	return str;
}

function message(type, to, text, ref,options) {
	var m = { id: guid(), type: type, from: nick, to: to, text: text || '', time: core.time(), ref: ref || '' };
	
	if (type==="nick") {
		m.auth=options;
	}
	if (m.type != 'result-start' && m.type != 'result-end' && socket.socket.connected) {
		socket.emit('message', m);
	}
	if(typeof messageArray !=="undefined" && rooms[to]) {
		console.log(m.type);
		rooms[to].messages.push(m);
		if(requests[to + '//']) requests[to + '//'](true);
	}
	return m;
}

function requestTime() { socket.emit('time', new Date().getTime()); }
requestTime(); setTimeout(requestTime, 300000);
socket.on('time', function(data) {
	// time adjustment is the time taken for outbound datagram to reach.
	timeAdjustment = data.server - data.request;
});
core.time = function() { return new Date().getTime() + timeAdjustment; };

socket.on('error', function(message) {
	console.log(message);
	core.emit('error',message);
});

socket.on('messages', function(data) {
	var roomId = data.query.to, reqId = data.query.to + '/' + (data.query.since || '') +
			'/' + (data.query.until || '');
			
	console.log("Response:", reqId, snapshot(data.messages));
	rooms[roomId].messages.merge(data.messages);
	console.log("Cached:", snapshot(rooms[roomId].messages));
	
	if (requests[reqId]) {
		requests[reqId](true);
		if(reqId != data.query.to + '//') delete requests[reqId];
	}
});



core.get = function(room, start, end, callback) {
	var query = { to: room, type: 'text' },
		reqId;
	if (start) { query.since = start; }
	if (end) { query.until = end; }
	
	reqId = room + '/' + (query.since || '') + '/' + (query.until || '');
	
	console.log("Request:", reqId);
	requests[reqId] = callback;
	socket.emit('messages', query);
};



socket.on('message', function(message) {
	var i, messages, updated = false;
	console.log("Received:", message);
	core.emit('notify', message);
	switch (message.type) {
		case 'abuse_report':
			core.emit("abuse_report",message.id);
			return;
			break;
		case 'nick':
			if (message.from == nick) {
				nick = message.ref;
				core.emit('nick', message.ref);
				return;
			}
			break;
		case 'text':
		case 'result-start':
		case 'result-end':
			break;
		default:
			return;
	}
	
	messages = rooms[message.to] && rooms[message.to].messages;
	if (!messages) return;
	for (i = messages.length - 1; i >= 0 && message.time - messages[i].time < 5000; i-- ) {
		if (messages[i].id == message.id) {
			messages[i] = message;
			updated = true; break;
		}
	}
	if (!updated) {
		messages.push(message);
	}
	if(requests[message.to + '//']) requests[message.to + '//'](true);
});


core.say = function (to, text) {
	message('text', to, text);
};

core.nick = function(n, auth) {
	if (!n) return nick;
	message('nick', '', '', n, auth);
	return n;
};

core.watch = function(room, time, before, after, callback) {
	function missing(start, end) {
		core.get(room, start, end, send);
		return { type: 'missing', text: 'Loading messages...', time: start };
	}
	function send(isResponse) {
		var r = rooms[room].messages.extract(
			time || core.time(), before || 32,
			after || 0, isResponse? null: missing
		);
		callback(r);
	}
	
	if (!time) {
		requests[room + '//'] = send;
	}
	send(false);
};

core.unwatch = function(room) {
	delete requests[room + '//'];
};

core.update=function(type,params){
	console.log("sending update");
	socket.emit("update",{
		type:type,
		params:params
	});
};


function snapshot (messages) {
	return '{' + prettyDate(messages[0].time) + ' ' + messages.map(function(message) {
		switch (message.type) {
			case 'result-start': return '(' + prettyDate(message.time) + ' ';
			case 'result-end': return ' ' + prettyDate(message.time) + ')';
			default: return '';
		}
	}).join('') + ' ' + prettyDate(messages[messages.length-1].time) + '}';
}

/* TODO: implement them someday

core.occupants = function(query, callback) {}
core.followers = function(query, callback) {}
core.labels = function(query, callback) {}

*/

socket.on("ERR_AUTH_FAIL",function(){
	console.log("Login failed");
});

socket.on("ERR_AUTH_NEW",function(){
	core.emit("ERR_AUTH_NEW");
});

