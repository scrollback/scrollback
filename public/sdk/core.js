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
 */

"use strict";
var socket = io.connect(scrollback.host);
var timeAdjustment = 0;
var rooms = {}, requests = {}, lastPos;
var core = Object.create(emitter);

socket.on('connect', function() {
	/* global scrollback, io, EventEmitter */
	if(scrollback.streams && scrollback.streams.length) {
		scrollback.streams.forEach(function(id) {
			if(!id) return;
			core.enter(id);
		});
	}
	core.emit('connected');
});

socket.on('disconnect', function() {
	var id;
	for(id in rooms) if(rooms.hasOwnProperty(id)) core.leave(id);
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
	delete rooms[id];
};

function guid() {
    var str="", i;
	for(i=0; i<32; i++) str += (Math.random()*16|0).toString(16);
	return str;
}

function message(type, to, text) {
	var m = { type: type, to: to, guid: guid(), text: text || '', time: core.time() };
	if (message.type == 'result-start' || message.type == 'result-end') {
		return m;
	}
    if(socket.socket.connected) socket.emit('message', m);
	rooms[to].messages.push(m);
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
	log(message);
});

socket.on('messages', function(data) {
	var roomId = data.query.to, reqId = data.query.to + '/' + (data.query.since || '') +
			'/' + (data.query.until || '');
	rooms[roomId].messages.merge(data.messages);
	log("response", data.messages.length);
	if (requests[reqId]) {
		requests[reqId](true);
		if(reqId != data.query.to + '//') delete requests[reqId];
	}
});

core.get = function(room, start, end, callback) {
	var query = { to: room, type: 'text' },
		reqId = room + '/' + (start || '') + '/' + (end || '');
	if (start) { query.since = start; }
	if (end) { query.until = end; }
	
	log("requesting", reqId);
	requests[reqId] = callback;
	socket.emit('messages', query);
};

socket.on('message', function(message) {
	var i, messages = rooms[message.to].messages, updated = false;
	for (i = messages.length - 1; i >= 0 && message.time - messages[i].time < 5000; i-- ) {
		if (messages[messages.length-1].guid == message.guid) {
			messages[messages.length-1] = message;
			updated = true; break;
		}
	}
	if (!updated) messages.push(message);
	if(requests[message.to + '//']) requests[message.to + '//'](true);
});

core.say = function (to, text) {
	rooms[to].messages.push(message('text', to, text));
};

socket.on('nick', function(n) {
	log("Received nick", n);
	core.emit('nick', n);
});
core.nick = function(n) {
	socket.emit('nick', n);
};

core.watch = function(room, time, before, after, callback) {
	function missing(start, end) {
		log("Missing ", start, end);
		core.get(room, start, end, send);
		return { type: 'missing', text: 'Loading messages...', time: start };
	}
	function send(isResponse) {
		var r = rooms[room].messages.extract(time || core.time(), before, after, isResponse? null: missing );
		log("Extracted ", r);
		callback(r);
	}
	
	send(false);
};

/* TODO: implement them someday

core.occupants = function(query, callback) {}
core.followers = function(query, callback) {}
core.labels = function(query, callback) {}

*/
