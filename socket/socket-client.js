"use strict";
/* global libsb, SockJS*/

var generate = require("../lib/generate.js"),
	config = require("../client-config.js"),
	core;

var backOff = 1, 
    client, pendingQueries = {},
	pendingActions = {},
	queue = [];

module.exports = function (c) {
	core = c;
    connect();
    core.on("disconnect", disconnect, 1000);

	core.on("init-up", sendInit, 10);
	core.on("text-up", sendText, 10);
	core.on("edit-up", sendEdit, 10);
	core.on("back-up", sendBack, 10);
	core.on("away-up", sendAway, 10);
	core.on("nick-up", sendInit, 10);
	core.on("join-up", sendJoin, 10);
	core.on("part-up", sendPart, 10);
	core.on("admit-up", sendAdmit, 10);
	core.on("expel-up", sendExpel, 10);
	core.on("user-up", sendUser, 10);
	core.on("room-up", sendRoom, 10);

    core.on("getTexts", function(query, callback){
		query.type="getTexts";
		sendQuery(query, callback);
	}, 10);

    core.on("getThreads",  function(query, callback){
		query.type="getThreads";
		sendQuery(query, callback);
	}, 10);

    core.on("getUsers",  function(query, callback){
		query.type="getUsers";
		sendQuery(query, callback);
	}, 10);

    core.on("getRooms",  function(query, callback){
		query.type="getRooms";
		sendQuery(query, callback);
    }, 10);
};


libsb.on("inited", function (undef, next) {
	while (queue.length) {
		queue.splice(0, 1)[0]();
	}
	next();
}, 500);

function safeSend(data) {
	// safeSends sends the data over the socket only after the socket has
	// been initialised

	if (libsb.isInited) {
		client.send(data);
	} else {
		queue.push(function () {
			client.send(data);
		});
	}
}

function connect() {
	client = new SockJS(config.server.host + "/socket");
    client.onclose = disconnected;
    
	client.onopen = function(){
        backOff = 1;
        core.emit("init-up", {}, function(err) {
			if(err) console.log(err.message);
			else libsb.isInited = true;
			
			core.emit("navigate", {connectionStatus: true, source: "socket"}, function(err) {
				if(err) console.log(err.message);
			});
			//TODO: handle errors.
        });
	};

	client.onmessage = receiveMessage;
}

function disconnect(payload, next) {
	client.close();
	next();
}

function disconnected() {
	if(backOff === 1) {
		core.emit("navigate", {connectionStatus: false, source: "connection"}, function(err) {
			if(err) console.log(err.message);
		});
	}
	if(backOff < 180) backOff *= 2;
	else backOff = 180;
    setTimeout(connect, backOff*1000);
}

function sendQuery(query, next){
	if(query.results) return next();
	
	if(!libsb.isInited){
		query.results = [];
		return next();
	}
	if (!query.id) query.id = generate.uid();

	query.session = libsb.session;
	query.resource = libsb.resource;

	safeSend(JSON.stringify(query));

	pendingQueries[query.id] = next;
	pendingQueries[query.id].query = query;
}

function receiveMessage(event) {
	var data;
	try {
		data = JSON.parse(event.data);
	} catch (err) {
		core.emit("error", err);
	}
	if (data.type == "error") {
		if (pendingActions[data.id]) {
			pendingActions[data.id](data);
			delete pendingActions[data.id];
		}
		core.emit("error-dn", data);
	} else if (["getTexts", "getThreads", "getUsers", "getRooms", "getSessions"].indexOf(data.type) != -1) {
		if (pendingQueries[data.id]) {
			pendingQueries[data.id].query.results = data.results;
			pendingQueries[data.id]();
			delete pendingQueries[data.id];
		}
	} else {
		//data is an action
		if (pendingActions[data.id]) {
			pendingActions[data.id](data);
			delete pendingActions[data.id];
		}
		core.emit(data.type + "-dn", data);
	}
}

function returnPending(action, next) {

	return function (newAction) {
		var i;
		if (newAction.type === "error") return next(newAction);

		for (i in action) delete action[i];
		for (i in newAction) {
			if (newAction.hasOwnProperty(i)) action[i] = newAction[i];
		}
		next();
	};
}

function makeAction(action, props) {
	var i;
	for (i in action) {
		delete action[i];
	} //doing something weird and stupid to maintain the reference of the object. should change this soon.
	for (i in props) {
		if (props.hasOwnProperty(i)) action[i] = props[i];
	}

	if(libsb.user && libsb.user.id) {
		action.from = libsb.user.id;
	}
	
	action.time = new Date().getTime();
	action.session = libsb.session;
	action.resource = libsb.resource;
	return action;
}

function sendJoin(join, next) {
	var action = makeAction(join, {
		type: 'join',
		to: join.to,
		id: join.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendPart(part, next) {
	var action = makeAction(part, {
		type: 'part',
		to: part.to,
		id: part.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendBack(back, next) {
	var action = makeAction(back, {
		type: 'back',
		to: back.to,
		id: back.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendAway(away, next) {
	var action = makeAction(away, {
		type: 'away',
		to: away.to,
		id: away.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendText(text, next) {

	var action = makeAction(text, {
		to: text.to,
		type: 'text',
		text: text.text,
		from: text.from,
		threads: text.threads,
		id: text.id,
		labels: text.labels || {},
		mentions: text.mentions || [],
        origin: text.origin
	});

	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendEdit(edit, next) {
	var action = makeAction(edit, {
		to: edit.to,
		type: 'edit',
		id: edit.id,
		ref: edit.ref,
		labels: edit.labels,
		text: edit.text
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendInit(init, next) {
	var action, newAction = {
		type: 'init',
		to: 'me',
		id: init.id,
		origin: init.origin
	};
	newAction.session = init.session;

	if (init.auth) newAction.auth = init.auth;
	if (init.suggestedNick) newAction.suggestedNick = init.suggestedNick;
	action = makeAction(init, newAction);

	client.send(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendAdmit(admit, next) {
	var action = makeAction(admit, {
		type: 'admit',
		to: admit.to,
		ref: admit.ref,
		id: admit.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendExpel(expel, next) {
	var action = makeAction(expel, {
		type: 'expel',
		to: expel.to,
		ref: expel.ref,
		id: expel.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendUser(user, next) {
	var action = makeAction(user, {
		type: 'user',
		to: "me",
		user: user.user,
		id: user.id
	});
	safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}

function sendRoom(room, next) {
	var action = makeAction(room, {
		type: 'room',
		to: room.to,
		room: room.room,
		id: room.id
	});
    safeSend(JSON.stringify(action));
	pendingActions[action.id] = returnPending(action, next);
}
