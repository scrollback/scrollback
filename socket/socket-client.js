var sockjs = require('sockjs-client'),
	generate = require('generate'),
	config = require('../client-config');

module.exports = function(core){
	core.on('connection-requested', connect);
	core.on('text-up', sendText, 1000);
	core.on('back-up', sendBack, 1000);
	core.on('away-up', sendAway, 1000);
	core.on('nick-up', sendInit, 1000);
	
	core.on('getTexts', getTexts);
};

var client;
var pendingQueries = {}, pendingActions = {};

function connect(){
	client = sockjs.connect(config.sockjs, function(){
		core.emit('connected');
	});
	
	client.onmessage = recieveMessage;
}

function getTexts(query, next){
	
	if(query.results) return next();
	
	if(!query.queryId) query.queryId = generate.guid();
	
	client.send(JSON.stringify(query));
	pendingQueries[query.queryId] = next;
}

function recieveMessage(event){
	var data;
	try{
		data = JSON.parse(event.data);
	}catch(err){
		core.emit("error", err);
	}
	
	if(data.queryId){
		// data is a query
		if(pendingQueries[data.queryId]){
			pendingQueries[data.queryId](data);
			delete pendingQueries[data.queryId];
		}
	}else{
		//data is an action
		if(pendingActions[data.id]){
			pendingActions[data.id](data);
			delete pendingActions[data.id];
		}
		core.emit(data.type + '-dn', data);
	}
}

function getActionGenerics(){
	var action = {};
	action.id = generate.guid();
	action.from = libsb.user.id;
	action.user = libsb.user;
	action.room = libsb.room;
	action.time = new Date().getTime();
}

function sendBack(roomId, next){
	var action = {};
	
	action = getActionGenerics();
	action.type = 'back';
	action.to = roomId;
	
	client.send(JSON.stringify(action));
	pendingActions[action.actionId] = next;
}

function sendAway(roomId, next){
	var action = {};
	
	action = getActionGenerics();
	action.type = 'away';
	action.to = roomId;
	
	client.send(JSON.stringify(action));
	pendingActions[action.actionId] = next;
}

function sendText(roomId, next){
	var action = {};
	
	action = getActionGenerics();
	action.type = 'text';
	action.to = roomId;
	
	client.send(JSON.stringify(action));
	pendingActions[action.actionId] = next;
}

function sendInit(roomId, next){
	var action = {};
	
	client.send(JSON.stringify(action));
	pendingActions[action.actionId] = next;
}

