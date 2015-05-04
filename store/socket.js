/* jshint browser:true */
/* global SockJS*/

"use strict";

var generate = require("../lib/generate.js"),
	appUtils = require("../lib/app-utils.js"),
	config, core, client, store;

var backOff = 1,
	client, pendingQueries = {},
	pendingActions = {},
	session, resource, queue = [],
	initDone = false,
	actionQueue = [];

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;

	connect();

    [ "getTexts", "getUsers", "getRooms", "getThreads", "getEntities" ].forEach(function(e) {
		core.on(e, function(q, n) {
			q.type = e;
			if (initDone) {
				sendQuery(q, n);
			} else {
				queue.push(function() {
					sendQuery(q, n);
				});
			}
		}, 10);
	});

	[
		"text-up", "edit-up", "back-up", "away-up",
		"join-up", "part-up", "admit-up", "expel-up", "room-up"
	].forEach(function(event) {
		core.on(event, function(action, next) {
			action.type = event.replace(/-up$/, "");
			if (initDone) {
				sendAction(action);
			} else {
				actionQueue.push(function() {
					sendAction(action);
				});
			}
			next();
		}, 1);
	});

	 core.on("user-up", function(userUp, next) {
		 if (appUtils.isGuest(userUp.user.id)) {
			 next();
			 core.emit("user-dn", userUp);
		 } else {
			 userUp.type = "user";
			 if (initDone) {
				sendAction(userUp);
			} else {
				actionQueue.push(function() {
					sendAction(userUp);
				});
			}
			 next();
		 }
	 }, 1);
	core.on("init-up", function(init, next) {
		if (!init.session) session = init.session = "web://" + generate.uid();
		init.type = "init";
		init.to = "me";
		client.send(JSON.stringify(init));
		pendingActions[init.id] = function(init) {
			if (init.type === "init") {
				initDone = true;
				while (queue.length) {
					queue.splice(0, 1)[0]();
				}
				core.emit("setstate", {
					app: {
						connectionStatus: "online"
					},
					user: init.user.id
				});
			}
		};

		next();
	}, 1);

	core.on("statechange", function(changes, next) {
		if (changes.app && changes.app.connectionStatus === "online") {
			initDone = true;
			while (queue.length) {
				queue.splice(0, 1)[0]();
			}
		}
		next();
	}, 1000);
};

function sendAction(action) {
	action.session = session;
	action.from = store.get("user");
	client.send(JSON.stringify(action));
}

function sendQuery(query, next) {
	query.session = session;
	client.send(JSON.stringify(query));
	pendingQueries[query.id] = next;
	pendingQueries[query.id].query = query;
}

function connect() {
	client = new SockJS(config.server.protocol + "//" + config.server.host + "/socket");
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
		core.emit("setstate", {
			app: {
				connectionStatus: "offline"
			}
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
	if (["getTexts", "getThreads", "getUsers", "getRooms", "getSessions", "getEntities", "error"].indexOf(data.type) !== -1) {
		if (pendingQueries[data.id]) {
			pendingQueries[data.id].query.results = data.results;
			pendingQueries[data.id]();
			delete pendingQueries[data.id];
		}
	}

	if (["text", "edit", "back", "away", "join", "part", "admit", "expel", "user", "room", "init", "error"].indexOf(data.type) !== -1) {
		//data is an action
		if (pendingActions[data.id]) {
			pendingActions[data.id](data);
			delete pendingActions[data.id];
		}
//		console.log(data.type+ "-dn", data);
		core.emit(data.type + "-dn", data);
	}
}

function sendInit() {
	var init = {};
	init.id = generate.uid();
	resource = init.resource = generate.uid();
	init.type = "init";
	init.to = "me";
	init.origin = {};
	core.emit("init-up", init, function() {});
}
