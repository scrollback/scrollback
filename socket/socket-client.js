/* global libsb */
/* global core */

var sockjs = require('sockjs-client'),
	generate = require('../lib/generate'),
	config = require('../client-config');
var core;

module.exports = function(c){
	core = c;
	core.on('connection-requested', connect);
	core.on('disconnect', disconnect);
	
	core.on('init-up', sendInit, 1000);
	core.on('text-up', sendText, 1000);
	core.on('back-up', sendBack, 1000);
	core.on('away-up', sendAway, 1000);
	core.on('nick-up', sendInit, 1000);
	core.on('join-up', sendJoin, 1000);
	core.on('part-up', sendPart, 1000);
	core.on('admit-up', sendAdmit, 1000);
	core.on('expel-up', sendExpel, 1000);
	
	core.on('getTexts', sendQuery);
	core.on('getThreads', sendQuery);
	core.on('getUsers', sendQuery);
	core.on('getRooms', sendQuery);
	core.on('getSessions', sendQuery);
	
};

var client;
var pendingQueries = {}, pendingActions = {};

function connect(){
	client = new SockJS(config.sockjs.host);

	client.onopen = function(){
		core.emit('connected');
	}

	client.onmessage = receiveMessage;
	client.onclose = disconnected;
}

function disconnect(){
	client.close();
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
	var action = makeAction({type: 'init', to: 'me'});
	if(init.session) action.session = init.session;
	if(init.auth) action.auth = init.auth;
	if(init.suggestedNick) action.suggestedNick = init.suggestedNick;
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendAdmit(admit, next){
	var action = makeAction({type: 'admit', to: admit.to, ref: admit.ref});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}

function sendExpel(admit, next){
	var action = makeAction({type: 'expel', to: admit.to, ref: admit.ref});
	client.send(JSON.stringify(action));
	pendingActions[action.id] = next;
}
