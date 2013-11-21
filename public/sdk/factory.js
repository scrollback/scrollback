/*
dependencies: emitter.js
*/

var scrollbackModule = angular.module('scrollback' , []);
var factoryObject = Object.create(emitter), requests = {};
var messageCallback = {}, messagesCallback = {}, nick;

//This is done with the idea to reconnect on disconnect.
var socket = newSocket();

var roomFactory=function() {
	socket.onclose = function() {
		factoryObject.emit("disconnected");
		setTimeout(function(oldSocket){
			socket = newSocket();
			socket.close = oldSocket.close;
		}, 10000, socket);
	};

	factoryObject.message = send;

	factoryObject.messages = function(query, callback) {
		query.queryId=guid();
		messagesCallback[query.queryId] = callback;		
		socket.emit("messages", query);
	};

	factoryObject.listenTo = function(room){
		send({type:"result-start", to:room});
		send({type:"back", to:room});
	};

	return factoryObject;
};



function send(message, callback){
	message.id=guid();
	message.time = new Date().getTime();
	message.origin = {
		gateway : "web",
		location : window.location.toString(),
	};
	message.from = nick;

	if(callback) messageCallback[message.id] = callback;
	socket.emit("message", message);
}

scrollbackModule.factory('roomFactory', roomFactory);

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
	if(messagesCallback[data.queryId]) {
		messagesCallback[data.queryId](data);
		delete messagesCallback[data.queryId];
	}
	factoryObject.emit("messages", data);
};

onMessage = function(data){
	if(messageCallback[data.id]) {
		messageCallback[data.id](data);
		delete messagesCallback[data.id];
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
		case 'room': onRoom(d.data) break;
		case 'rooms': onRooms(d.data) break;
		case 'members': onmembers(d.data) break;
		case 'occupants': onOccupants(d.data) break;
		case 'error': onError(d.data); break;
	}
}

onInit = function(data) {
	nick = data.user.id;
};


function onError(err) {
	// these are exceptions returned from the server; not to be confused with onerror with small 'e'.
	if(err.id && messageCallback[err.id]) {
		messageCallback[err.id](err);
		delete messageCallback[err.id];
	}else if(err.queryId && messagesCallback[err.queryId]) {
		messageCallback[err.queryId](err);
		delete messageCallback[err.queryId];
	}
	factoryObject.emit('error', err.message);
}

// Function that handles socket error and not the errors sent by the server. That is handled by onError
function socketError(message) {
	scrollback.debug && console.log(message);
	factoryObject.emit("SOC_ERROR", message);
};
