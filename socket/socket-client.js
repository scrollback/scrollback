/* global libsb */

var sockjs = require('sockjs-client'),
	generate = require('../lib/generate.js'),
	config = require('../client-config.js'),
	core;

module.exports = function(c){
	core = c;
	core.on('connection-requested', connect);
	core.on('disconnect', disconnect);

	core.on('init-up', sendInit, 10);
	core.on('text-up', sendText, 10);
	core.on('back-up', sendBack, 10);
	core.on('away-up', sendAway, 10);
	core.on('nick-up', sendInit, 10);
	core.on('join-up', sendJoin, 10);
	core.on('part-up', sendPart, 10);
	core.on('admit-up', sendAdmit, 10);
	core.on('expel-up', sendExpel, 10);
	core.on('user-up', sendUser, 10);
	core.on('room-up', sendRoom, 10);
	core.on('getTexts', function(query, callback){
		query.type="getTexts";
		sendQuery(query, callback);
	});
	core.on('getThreads',  function(query, callback){
		query.type="getThreads";
		sendQuery(query, callback);
	});
	core.on('getUsers',  function(query, callback){
		query.type="getUsers";
		sendQuery(query, callback);
	});
	core.on('getRooms',  function(query, callback){
		query.type="getRooms";
		sendQuery(query, callback);
	});
};

var client;
var pendingQueries = {}, pendingActions = {};

function safeSend(data){
        // safeSends sends the data over the socket only after the socket has
        // been initialised
        if(libsb.isInited){
             client.send(data);
        }else{
            libsb.on('inited', function(d,n){
                client.send(data);
                n();
            });
        }
}

function connect(){
	client = new SockJS(config.server.host + "/socket");

	client.onopen = function(){
		core.emit('connected');
	};

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

	if(!query.id) query.id = generate.uid();

	query.session = libsb.session;
	query.resource = libsb.resource;
	safeSend(JSON.stringify(query));
	pendingQueries[query.id] = next;
	// a hacky solution. please change this.
	pendingQueries[query.id].query = query;
}

function receiveMessage(event){
	var data;
	try{
		data = JSON.parse(event.data);
	}catch(err){
		core.emit("error", err);
	}
	if(data.type == "error") {
		if(pendingActions[data.id]){
			pendingActions[data.id](data);
			delete pendingActions[data.id];
		}
		core.emit("error-dn", data);
	}else if(["getTexts", "getThreads", "getUsers", "getRooms", "getSessions"].indexOf(data.type) != -1){
		// data is a query
		if(pendingQueries[data.id]){
			// a hacky solution. please change this.
			pendingQueries[data.id].query.results = data.results;
			pendingQueries[data.id]();
			delete pendingQueries[data.id];
		}
	}else{
		//data is an action
		/*if(pendingActions[data.id]){
			pendingActions[data.id](data);
			delete pendingActions[data.id];
		}*/
		core.emit(data.type + '-dn', data);
	}
}

function makeAction(action) {
        // action.id = generate.uid();
	action.from = libsb.user.id;
	action.time = new Date().getTime();
	action.session = libsb.session;
	action.resource = libsb.resource;
	return action;
}

function sendJoin(join, next){
	var action = makeAction({type: 'join', to: join.to, id: join.id});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendPart(part, next){
	var action = makeAction({type: 'part', to: part.to, id: part.id});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendBack(back, next){
	var action = makeAction({type: 'back', to: back.to, id: back.id});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendAway(away, next){
	var action = makeAction({type: 'away', to: away.to, id: away.id});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendText(text, next){
	var action = makeAction(text, {to: text.to, type: 'text', text: text.text, from: text.from, threads: text.threads, id: text.id, labels: text.labels || {}, mentions: text.mentions || []});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendInit(init, next){
	var action = makeAction({type: 'init', to: 'me', id: init.id});
	if(init.session) action.session = init.session;
	if(init.auth) action.auth = init.auth;
	if(init.suggestedNick) action.suggestedNick = init.suggestedNick;
	client.send(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendAdmit(admit, next){
	var action = makeAction({type: 'admit', to: admit.to, ref: admit.ref, id: admit.id});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendExpel(expel, next){
	var action = makeAction({type: 'expel', to: expel.to, ref: expel.ref, id: expel.id});
	safeSend(JSON.stringify(action));
	next();
	// pendingActions[action.id] = next;
}

function sendUser(user, next) {
	var action = makeAction({type: 'user', to: "me", user: user.user, id: user.id});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = next;
	next();
}

function sendRoom(room, next){
	var action = makeAction({type: 'room', to: room.to, room: room.room, id: room.id});
	safeSend(JSON.stringify(action));
	next();
}
