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
var socket = new SockJS(scrollback.host + '/socket'),
	timeAdjustment = 0,
	rooms = {}, requests = {}, lastPos,
	core = Object.create(emitter),
	nick = "", user;

console.log(socket);

socket.emit = function(type, data) {
	console.log("Socket sending ", type, data);
	socket.send(JSON.stringify({type: type, data: data}));
};

socket.onopen = function() {
	var sid = document.cookie.match(/scrollback_sessid=(\w*)\;/);
	sid = sid? sid[1]: null;
	console.log(sid);
	/* global scrollback, io, EventEmitter */
	if(scrollback.streams &&  scrollback.streams.length) {
		scrollback.streams.forEach(function(id) {
			if(!id) return;
			core.enter(id);
		});
	}
	core.emit('connected');
	socket.emit('init', { sid: sid, clientTime: new Date().getTime() });
};

socket.onerror = function(message) {
	console.log(message);
	core.emit('error', message);
};

socket.onclose = function() {
	var id;
	for(id in rooms) if(rooms.hasOwnProperty(id)) core.leave(id);
	core.emit("disconnected");
};

socket.onmessage = function(evt) {
	var d;
	
	try { d = JSON.parse(evt.data); }
	catch(e) { console.log("ERROR: Non-JSON data", evt.data); return; }
	
	console.log("Socket received", d.type == init, init);
	
	switch(d.type) {
		case 'init': initSocket(d.data); break;
		case 'message': message(d.data); break;
		case 'messages': messages(d.data); break;
	}
};

function initSocket (data) {
	document.cookie = "scrollback_sessid="+data.sid;
	core.nick(data.user.id);
	timeAdjustment = data.serverTime - data.clientTime;
}

core.time = function() { return new Date().getTime() + timeAdjustment; };

core.enter = function (id) {
	if(!rooms[id]) rooms[id] = { messages: messageArray() };
	send('result-start', id);
	send('back', id);
	core.emit('enter', id);
};

core.leave = function (id) {
	send('away', id);
	send('result-end', id);
	core.emit('leave', id);
};

function send(type, to, text, options) {
	var m = { id: guid(), type: type, from: nick, to: to, text: text || '', time: core.time() }, i;
	
	if(options) for(i in options) if(options.hasOwnProperty(i)) {
		m[i] = options[i];
	}
	
	if (m.type != 'result-start' && m.type != 'result-end' && socket.readyState == 1) {
		socket.emit('message', m);
	}
	if(typeof messageArray !=="undefined" && rooms[to]) {
		rooms[to].messages.push(m);
		if(requests[to + '//']) requests[to + '//'](true);
	}
	return m;
}

function messages (data) {
	var roomId = data.query.to, reqId = data.query.to + '/' + (data.query.since || '') +
			'/' + (data.query.until || '');
			
	rooms[roomId].messages.merge(data.messages);
	
	if (requests[reqId]) {
		requests[reqId](true);
		if(reqId != data.query.to + '//') delete requests[reqId];
	}
}
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

function message (m) {
	var i, messages, updated = false;
	console.log("Received:", m);
	core.emit('message', m);
	switch (m.type) {
		case 'abuse_report':
			core.emit("abuse_report",m.id);
			return;
		case 'nick':
			if (m.from == nick) {
				nick = m.ref;
				core.emit('nick', m.ref);
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
	
	messages = rooms[m.to] && rooms[m.to].messages;
	if (!messages) return;
	for (i = messages.length - 1; i >= 0 && m.time - messages[i].time < 10000; i-- ) {
		if (messages[i].id == m.id) {
			timeAdjustment = m.time - messages[i].time;
			messages[i] = m;
			updated = true; break;
		}
	}
	if (!updated) {
		messages.push(m);
	}
	if(requests[m.to + '//']) requests[m.to + '//'](true);
}

core.say = function (to, text) {
	send('text', to, text);
};

core.nick = function(n, auth) {
	if (!n) return nick;
	send('nick', '', '', { nick: n, auth: auth });
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

/* TODO: implement them someday

core.occupants = function(query, callback) {}
core.followers = function(query, callback) {}
core.labels = function(query, callback) {}

*/

