/*
dependencies: emitter.js
*/
var scrollbackApp = angular.module('scrollbackApp' , ['ngRoute']);
var factoryObject = Object.create(emitter), requests = {};
var pendingCallbacks = {}, backed=false;



var factory=function() {
	socket.onclose = function() {
		factoryObject.emit("disconnected");
		factoryObject.isActive = false;
		setTimeout(function(oldSocket){
			socket = newSocket();
			socket.close = oldSocket.close;
		}, 10000, socket);
	};
	factoryObject.message = send;
	factoryObject.messages = getMessages;
	//factoryObject.messages = callbackGenerator("messages");
	factoryObject.room = callbackGenerator("room");
	factoryObject.rooms = callbackGenerator("rooms");
	factoryObject.occupants = callbackGenerator("occupants");
	factoryObject.membership = callbackGenerator("membership");

	factoryObject.listenTo = listenTo;
	return factoryObject;
};

getMessages = function (room, start, end, callback) {
	console.log("get messages recieved", room, start, end);
	var query = { to: room, type: 'text' },
		reqId;
	if (start) { query.since = start; }
	if (end) { query.until = end; }
	reqId = room + '/' + (query.since || '') + '/' + (query.until || '');
	
	console.log("Request:", reqId);
	requests[reqId] = callback;
	socketEmit('messages', query);
}

function socketEmit(type, data) {
	console.log("emit is in action");
	console.log("Socket sending ", type, data);
	socket.send(JSON.stringify({type: type, data: data}));
};


function callbackGenerator(event){
	return function(query, callback){
		query.queryId=guid();
		pendingCallbacks[query.queryId] = callback;		
		socket.emit(event, query);
	};
}


function send(message, callback){
	message.id=guid();
	message.time = new Date().getTime();
	message.origin = {
		gateway : "web",
		location : window.location.toString(),
	};
	if(callback) pendingCallbacks[message.id] = callback;
	socket.emit("message", message);
}


//This is done with the idea to reconnect on disconnect.
function newSocket() {
	var socket = new SockJS(scrollback.host + '/socket');
	
	socket.onopen = function() {
		init();
		listenTo(window.scrollback.room);
		factoryObject.emit("connected");
	};
	socket.onerror = socketError;
	socket.onmessage = socketMessage;
	socket.emit = function(type, data) {
		scrollback.debug && console.log("Socket sending ", type, data);
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
	//console.log("on messages was invoked", data.messages);
	factoryObject.emit("messages", data.messages);
};

onMessage = function(data){
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

	scrollback.debug &&	console.log("Socket received", d);
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
	console.log("sending back msg..");
	backed || (backed==true || (listenTo(window.scrollback.room)));
	factoryObject.isActive = true;
	factoryObject.nick = data.user.id;
};

handler=function(type, data){
	if(pendingCallbacks[data.queryId]) {
		pendingCallbacks[data.queryId](data);
		delete pendingCallbacks[data.queryId];
	}
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
 function listenTo(room){
	send({type:"result-start", to:room});
	send({type:"back", to:room});
};

var socket = newSocket();
scrollbackApp.factory('$factory', factory);