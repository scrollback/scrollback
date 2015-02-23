"use strict";
/* jshint browser:true */
/* global SockJS*/

var generate = require("../lib/generate.js"),
    config, core, client;


var backOff = 1,
	client, pendingQueries = {},
	pendingActions = {}, session, resource;

module.exports = function(c, conf) {
    core = c;
    config = conf;
    connect();
    ["getTexts", "getUsers","getRooms","getThreads"].forEach(function(e) {
        core.on(e, function(q, n) {
            q.type = e;
            sendQuery(q, n);
        },10);
    });
};

function sendQuery(query, next) {
	if (!query.id) query.id = generate.uid();
	query.session = session;
	client.send(JSON.stringify(query));
	pendingQueries[query.id] = next;
	pendingQueries[query.id].query = query;
    window.core = core;
}

function connect() {
	client = new SockJS(config.server.protocol + config.server.host + "/socket");
	client.onclose = disconnected;
    
	client.onopen = function() {
		backOff = 1;
        sendInit();
	};
    
	client.onmessage = receiveMessage;
}

function disconnected() {
	console.log("Disconnected:", backOff);
	if (backOff === 1) {
		core.emit("navigate", {
			connectionStatus: "offline",
			source: "connection"
		}, function(err) {
			if (err) console.log(err.message);
		});
	}
	if (backOff < 180) backOff *= 2;
	else backOff = 180;
	setTimeout(connect, backOff * 1000);
}

function receiveMessage(event) {
	var data;
	try {
		data = JSON.parse(event.data);
	} catch (err) {
		core.emit("error", err);
	}
    
    
    console.log("Got data back now: ", data);
	if (["getTexts", "getThreads", "getUsers", "getRooms", "getSessions", "error"].indexOf(data.type) != -1) {
		if (pendingQueries[data.id]) {
            console.log("calling the call back");
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

function sendInit() {
    var init = {};
    init.id = generate.uid();
    session = init.session = "web://"+generate.uid();
    resource = init.resource = generate.uid();
    init.type="init";
    init.to = "me";
    init.origin = {};
    
	client.send(JSON.stringify(init));
	pendingActions[init.id] = returnPending(init, function() {
        console.log("init done", arguments);
    });
}

function returnPending(action, next) {
	return function(newAction) {
		var i;
		if (newAction.type === "error") return next(newAction);

		for (i in action) delete action[i];
		for (i in newAction) {
			if (newAction.hasOwnProperty(i)) action[i] = newAction[i];
		}
		next();
	};
}
