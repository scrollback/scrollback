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
	nick = "", user,
	pendingCallbacks = {};

function sanitizeRoomName(room) {
	//this function replaces all spaces in the room name with hyphens in order to create a valid room name
	room = room.trim();
	room = room.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
	if(room.length<3) room=room+Array(3-room.length+1).join("-");
	return room;
}
if(window.scrollback.streams) {
	window.scrollback.streams = window.scrollback.streams.map(function(room) {
		return sanitizeRoomName(room);
	});
}
if(window.scrollback.nick) window.scrollback.nick = sanitizeRoomName(window.scrollback.nick);

socket.emit = function(type, data) {
	scrollback.debug && console.log("Socket sending ", type, data);
	socket.send(JSON.stringify({type: type, data: data}));
};

socket.onopen = function() {
	//scrollback.debug && console.log("Cookie", document.cookie);
	//var sid = document.cookie.match(/scrollback_sessid=(\w*)(\;|$)/);
	//sid = sid? decodeURIComponent(sid[1]): null;
	//
	function init(sid) {
		var initData={ sid: sid, clientTime: new Date().getTime() };

		if (scrollback.nick) {
			initData.nick=scrollback.nick;
		}
		socket.emit('init', initData);
	}
	//if(sid) init(sid);
	//else
	getx(scrollback.host + '/dlg/cookie', function(err, data) {
		if(err) return;
		init(data);
	});
};

socket.onerror = function(message) {
	// These are socket-level errors, not to be confused with onError with capital E.
	scrollback.debug && console.log(message);
};

socket.onclose = function() {
	var id;
	for(id in rooms) if(rooms.hasOwnProperty(id)) core.leave(id);
	core.emit("disconnected");
};

socket.onmessage = function(evt) {
	var d;

	try { d = JSON.parse(evt.data); }
	catch(e) { scrollback.debug && console.log("ERROR: Non-JSON data", evt.data); return; }

	scrollback.debug && console.log("Socket received", d);

	switch(d.type) {
		case 'init': onInit(d.data); break;
		case 'message': onMessage(d.data); break;
		case 'messages': onMessages(d.data); break;
		case 'error': onError(d.data); break;
	}
};

function onInit (data) {
	//document.cookie = "scrollback_sessid="+encodeURIComponent(data.sid);
	nick = data.user.id;
	core.membership = data.user.membership;
	core.emit('membership', data.user.membership);
	core.emit('nick', nick);
	if (!data.serverTime||!data.clientTime) {
		return;
	}
	core.emit('connected');
	timeAdjustment = data.serverTime - data.clientTime;
	scrollback.debug && console.log(data);
	if(scrollback.streams &&  scrollback.streams.length ) {
		scrollback.streams.forEach(function(id) {
			if(!id) return;
			core.enter(id);
		});
	}

}

core.cache = function (id){
    return rooms[id].messages;
}

core.time = function() {
	return (new Date()).getTime() + timeAdjustment;
};

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

function send(type, to, text, options, callback) {
	var m = { id: guid(), type: type, from: nick, to: to, text: text || '', time: core.time() }, i;


	m.origin = {
		gateway : "web",
		location : window.location.toString(),
	};
	if(options) for(i in options) if(options.hasOwnProperty(i)) {
		m[i] = options[i];
	}

	if (m.type != 'result-start' && m.type != 'result-end' && socket.readyState == 1) {
		socket.emit('message', m);
	}

	if(typeof messageArray !=="undefined" && rooms[to]) {
		rooms[to].messages.push(m);
		i = rooms[to].messages.length - 1;
		if(requests[to + '//']) requests[to + '//'](true);
	}



	pendingCallbacks[m.id] = function(obj) {
		if(obj.message && typeof messageArray !=="undefined" && rooms[to]) {
			// obj is an error. remove the message from the cache.
			rooms[to].messages.splice(i, 1);
			if(requests[to + '//']) requests[to + '//'](true);
		}
		if(callback) callback(obj);
	}

	setTimeout(function() {
		if(pendingCallbacks[m.id]) delete pendingCallbacks[m.id];
	}, 10000);

	return m;
}

function onMessages (data) {
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

	scrollback.debug && console.log("Request:", reqId);
	requests[reqId] = callback;
	socket.emit('messages', query);
};

function onMessage (m) {
	var i, messages, updated = false;
	scrollback.debug && console.log("Received:", m);
	core.emit('message', m);

	if(m.type=="nick" && m.from==core.nick()) {
		core.nick(m.ref);
	}

	if(pendingCallbacks[m.id]) {
		pendingCallbacks[m.id](m);
		delete pendingCallbacks[m.id];
	}

	messages = rooms[m.to] && rooms[m.to].messages;

	if (!messages) return;
	for (i = messages.length - 1; i >= 0 && m.time - messages[i].time < 120000; i-- ) {
		if (messages[i].id == m.id) {
			//timeAdjustment = m.time - messages[i].time - timeAdjustment;
			scrollback.debug && console.log("Time adjustment is now " + timeAdjustment);
			messages[i] = m;
			updated = true; break;
		}
	}
	if (!updated) {
		messages.push(m);
	}
	if(requests[m.to + '//']) requests[m.to + '//'](true);
}

core.say = function (to, text, callback) {
	send('text', to, text,{}, callback);
};

core.join = function(type, to){
	send(type,to);
}

core.nick = function(n, callback) {
	if (!n) return nick;
	if(typeof n === 'string') n = {ref: n};
	if(callback) {
		send('nick', '', '', n, function(reply) {
			if(reply.ref) {
				nick = reply.ref;
				core.emit('nick', nick);
			}
			if(callback)
			return callback(reply);
		});
	}else {
		nick = n.ref;
		core.emit('nick', nick);
		return n;
	}

};

core.watch = function(room, time, before, after, callback) {

	function missing(start, end) {
		core.get(room, start, end, deliverMessages);
		return { type: 'missing', text: 'Loading messages...', time: start };
	}
	function deliverMessages(isResponse) {
		var r = rooms[room].messages.extract(
			time, before || 32,
			after || 0, isResponse? null: missing
		);

		callback(r);
	}

	if (!time) {
		requests[room + '//'] = deliverMessages;
	}
	deliverMessages(false);
};

core.unwatch = function(room) {
	delete requests[room + '//'];
};

core.update=function(type,params){
	scrollback.debug && console.log("sending update");
	socket.emit("update",{
		type:type,
		params:params
	});
};

function onError(err) {
	// these are exceptions returned from the server; not to be confused with onerror with small 'e'.

	if(err.id && pendingCallbacks[err.id]) {
		pendingCallbacks[err.id](err);
		delete pendingCallbacks[err.id];
	}

	core.emit('error', err.message);
}

/* TODO: implement them someday

core.occupants = function(query, callback) {}
core.followers = function(query, callback) {}
core.labels = function(query, callback) {}

*/
