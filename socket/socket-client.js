/* global libsb */
var sockjs = require('sockjs-client'),
	generate = require('generate'),
	config = require('../client-config');

module.exports = function(core){
	core.on('connection-requested', connect);
	core.on('text-up', sendText, 1000);
	core.on('back-up', sendBack, 1000);
	core.on('away-up', sendAway, 1000);
	core.on('nick-up', sendInit, 1000);
	core.on('join-up', sendJoin, 1000);
	core.on('part-up', sendPart, 1000);
	
	core.on('getTexts', sendQuery);
	core.on('getThreads', sendQuery);
	core.on('getUsers', sendQuery);
	core.on('getRooms', sendQuery);
	core.on('getSessions', sendQuery);
};

var client;
var pendingQueries = {}, pendingActions = {};

function connect(){
	client = sockjs.connect(config.sockjs, function(){
		core.emit('connected');
	});
	
	client.onmessage = receiveMessage;
	client.onclose = disconnected;
}

function disconnected(){
	core.emit('disconnected');
}

function sendQuery(query, next){
	if(query.results) return next();
	
	if(!query.id) query.id = generate.guid();
	
	client.send(JSON.stringify(query));
	pendingQueries[query.id] = next;
}

function receiveMessage(event){
	var data;
	try{
		data = JSON.parse(event.data);
	}catch(err){
		core.emit("error", err);
	}
	
	if(["getTexts", "getThreads", "getUsers", "getRooms", "getSessions"].indexOf(data.type) != -1){
		// data is a query
		if(pendingQueries[data.id]){
			pendingQueries[data.id](data);
			delete pendingQueries[data.id];
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

function makeAction(o) {
	var action = {
		id: generate.guid,
		from: libsb.user.id,
		to: libsb.room.id,
		time: new Date().getTime()
	};
	
	for(var i in o) action[i] = o[i];
	return action;
}

function sendJoin(join, next){
	var action = makeAction({type: 'join', to: join.to});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendPart(part, next){
	var action = makeAction({type: 'part', to: part.to});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendBack(back, next){
	var action = makeAction({type: 'back', to: back.to});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendAway(away, next){
	var action = makeAction({type: 'away', to: away.to});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendText(text, next){
	var action = makeAction({type: 'text', to: text.to, text: text.text});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendInit(init, next){
	var action = makeAction({type: 'init'});
	if(init.session) action.session = init.session;
	if(init.auth) action.auth = init.auth;
	if(init.suggestedNick) action.suggestedNick = init.suggestedNick;
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

