/*
dependencies: emitter.js
*/
var scrollbackApp = angular.module('scrollbackApp' , ['ngRoute']);
var factoryObject = Object.create(emitter), requests = {};
var pendingCallbacks = {}, nick;



var factory=function() {
	socket.onclose = function() {
		factoryObject.emit("disconnected");
		setTimeout(function(oldSocket){
			socket = newSocket();
			socket.close = oldSocket.close;
		}, 10000, socket);
	};

	factoryObject.message = send;
	factoryObject.messages = callbackGenerator("messages");
	factoryObject.room = callbackGenerator("room");
	factoryObject.rooms = callbackGenerator("rooms");
	factoryObject.occupants = callbackGenerator("occupants");
	factoryObject.membership = callbackGenerator("membership");

	factoryObject.listenTo = function(room){
		console.log("listening to... ", room);
		send({type:"result-start", to:room});
		send({type:"back", to:room});
	};

	return factoryObject;
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
	message.from = nick;

	if(callback) pendingCallbacks[message.id] = callback;
	socket.emit("message", message);
}


//This is done with the idea to reconnect on disconnect.
function newSocket() {
	var socket = new SockJS(scrollback.host + '/socket');
	
	socket.onopen = function() {
		init();
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
	
};

onMessage = function(data){
	if(pendingCallbacks[data.id]) {
		pendingCallbacks[data.id](data);
		delete pendingCallbacks[data.id];
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
	nick = data.user.id;
	factoryObject.emit("init", data);
	factoryObject.emit("nick", nick);
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


var socket = newSocket();
scrollbackApp.factory('$factory', factory);