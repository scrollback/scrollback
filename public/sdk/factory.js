/*
dependencies: emitter.js
*/
var scrollbackApp = angular.module('scrollbackApp' , ['ngRoute']);
var rooms = {};
var factoryObject = Object.create(emitter), requests = {};
var listening = {};
var pendingCallbacks = {}, backed=false;
var backOff = 1;
var factory=function() {
	socket.onclose = function() {
		factoryObject.emit("disconnected");
		backOff+=backOff;
		factoryObject.isActive = false;
		setTimeout(function(oldSocket){
			socket = newSocket();
			socket.onclose = oldSocket.onclose;
		}, backOff*1000, socket);
	};
	factoryObject.message = send;
	factoryObject.messages = getMessages;
	//factoryObject.messages = callbackGenerator("messages");
	factoryObject.room = callbackGenerator("room");
	factoryObject.rooms =  function(query, callback) {
		console.log(rooms);
		if(query.id && rooms["query.id"]){
			return callback({query:query, data: rooms["query.id"]});
		}
		callbackGenerator("rooms")(query, callback);
	}
	factoryObject.occupants = callbackGenerator("occupants");
	factoryObject.membership = callbackGenerator("membership");
	factoryObject.leaveRest = function(room) {
		Object.keys(listening).forEach(function(element) {
			listening[element] && element!=room && leave(element);
		});
	};

	factoryObject.enter = enter;
	factoryObject.leave = leave;
	return factoryObject;
};

getMessages = function (room, start, end, callback) {
	var query = { to: room, type: 'text' };
	if (start) { query.since = start; }
	if (end) { query.until = end; }
	query.queryId = guid();
	pendingCallbacks[query.queryId] = callback;			
	socketEmit('messages', query);
}

function socketEmit(type, data) {
	socket.send(JSON.stringify({type: type, data: data}));
};


function callbackGenerator(event){
	return function(query, callback){
		query.queryId = guid();
		pendingCallbacks[query.queryId] = callback;		
		socketEmit(event, query);
	};
}


function send(message, callback) {
	if(message.type == "back")	listening[message.to] = true;
	if(message.type == "away")	listening[message.to] = false;
	message.id = guid();
	message.time = new Date().getTime();
	message.origin = {
		gateway : "web",
		location : window.location.toString(),
	};
	if(callback) pendingCallbacks[message.id] = callback;
	socket.emit("message", message);
	
	$('html, body').animate({scrollTop:$(document).height()}, 'slow'); //scrolling down to bottom of page.
}


//This is done with the idea to reconnect on disconnect.
function newSocket() {
	var socket = new SockJS(scrollback.host + '/socket');
	
	socket.onopen = function() {
		backOff = 1;
		init();
		factoryObject.emit("connected");
	};
	socket.onerror = socketError;
	socket.onmessage = socketMessage;
	socket.emit = function(type, data) {
		//scrollback.debug && console.log("Socket sending ", type, data);
		socket.send(JSON.stringify({type: type, data: data}));
	};
	return socket;
}


function init(){
	function init(sid) {
		var initData={ sid: sid, clientTime: new Date().getTime() };
		
		if (scrollback.nick) {
			initData.nick=scrollback.nick;
		}
		socket.emit('init', initData);
	}
	getx(scrollback.host + '/dlg/cookie', function(err, data) {
		if(err) return;
		init(data);
	});
};


onMessages = function(data) {
	if(pendingCallbacks[data.query.queryId]) {
		console.log(data);
		pendingCallbacks[data.query.queryId](data.messages);
		delete pendingCallbacks[data.queryId];
	}
	factoryObject.emit("messages", data.messages);
};

onMessage = function(data){
	console.log("NEWMSG:", data);
	if(pendingCallbacks[data.id]) {
		pendingCallbacks[data.id](data);
		delete pendingCallbacks[data.id];
	}
	if(data.type == "nick" && data.ref){
		factoryObject.emit('nick', data.ref);
		factoryObject.nick = data.ref;
	}
	factoryObject.emit("message", data);
};

function socketMessage(evt) {
	var d;		
	try { d = JSON.parse(evt.data); }
	catch(e) {  console.log("ERROR: Non-JSON data", evt.data); return; }

	//scrollback.debug &&	console.log("Socket received", d);
	switch(d.type) {
		case 'init': onInit(d.data); break;
		case 'message': onMessage(d.data); break;
		case 'messages': onMessages(d.data); break;
		case 'room':  
		case 'rooms': 
		case 'members':  
		case 'occupants':  
			handler(d.type, d.data)
		break;

		case 'error': onError(d.data); break;
	}
}

onInit = function(data) {
	factoryObject.initialized = true;
	factoryObject.emit("init", data);
	factoryObject.emit("nick", data.user.id);
	backed || (backed==true || (enter(window.scrollback.room)));
	factoryObject.isActive = true;
	factoryObject.nick = data.user.id;
};

handler=function(type, data){
	if(pendingCallbacks[data.query.queryId]) {
		pendingCallbacks[data.query.queryId](data);
		delete pendingCallbacks[data.queryId];
	}
	// //temp simple caching of the rooms object.
	// if(type == "room") {
	// 	rooms[data.id] = data;
	// }else if(type=="rooms") {
	// 	data.data.forEach(function(element) {
	// 		rooms[element.id] = element;
	// 	});
	// }
	factoryObject.emit(type, data);
}

function onError(err) {
	// these are exceptions returned from the server; not to be confused with onerror with small 'e'.
	if(err.id && pendingCallbacks[err.id]) {
		pendingCallbacks[err.id](err);
		delete pendingCallbacks[err.id];
	}else if(err.queryId && pendingCallbacks[err.queryId]) {
		pendingCallbacks[err.queryId](err);
		delete pendingCallbacks[err.queryId];
	}
	factoryObject.emit('error', err.message);
}

// Function that handles socket error and not the errors sent by the server. That is handled by onError
function socketError(message) {
	scrollback.debug && console.log(message);
	factoryObject.emit("SOC_ERROR", message);
};
function enter(room) {
	factoryObject.emit("listening", room);
	send({type:"back", to:room});
};
function leave(room) {
	send({type:"away", to:room});
};

var socket = newSocket();
scrollbackApp.factory('$factory', factory);
