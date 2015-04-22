var config;
var log = require('../lib/logger.js');
var pg = require('pg');
var conString = "";
var textActions = ['text', 'edit'];
var occupantActions = ['back', 'away'];
var memberActions = ['join', 'part', 'admit', 'expel'];
var queriesAndActions = ['getTexts', 'getRooms', 'getThreads', 'getUsers', 'init', 'text', 'edit', 'join', 'part', 'away', 'back', 'admit', 'expel', 'room', 'user'];


module.exports = function(core, conf) {
	config = conf;
	conString = "pg://" + config.pg.username + ":" +
		config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

	init(core);

	textActions.forEach(function(type) {
		core.on(type, function(action, cb) {
			cb();
			saveTextActions(action);
		}, "watcher");
	});

	core.on('room', function(room, cb) {
		cb();
		saveRoomUserActions(room);
	}, "watcher");

	core.on('user', function(user, cb) {
		cb();
		saveRoomUserActions(user);
	}, "watcher");

	core.on('init', function(init, cb) {
		cb();
		saveSessionActions(init);
	}, "watcher");
	memberActions.forEach(function(ma) {
		core.on(ma, function(action, cb) {
			cb();
			saveMembersAction(action);
		}, "watcher");
	});
	occupantActions.forEach(function(a) {
		core.on(a, function(action, cb) {
			cb();
			saveOccupantAction(action);
		}, "watcher");
	});
};

function init(core) {
	queriesAndActions.forEach(function(event) {
		core.on(event, function(qa, callback) {
			qa.eventStartTime = new Date().getTime();
			callback();
		}, "antiflood");
		core.on(event, function(qa, callback) {
			log.d("queries: ", event, qa.id);
			log.d((new Date().getTime() - qa.eventStartTime));
			var params = [];
			var values = [];
			params.push('id');
			values.push(qa.id);
			params.push('type');
			values.push(event);
			params.push('timestamp');
			values.push(new Date(qa.eventStartTime).toISOString());
			params.push('time');
			values.push(new Date().getTime() - qa.eventStartTime);
			insert('time_queries_actions', params, values);
			delete qa.eventStartTime;
			callback();
		}, "watcher");
	});
}

function saveOccupantAction(action) {
	var pav = getParamsAndValues(action);
	var params = pav.params;
	var values = pav.values;
	params.push('to');
	values.push(action.to);
	if (action.text) {
		params.push('text');
		values.push(action.text);
	}
	insert("occupant_actions", params, values);
}

function saveSessionActions(action) {
	var pav = getParamsAndValues(action);
	var params = pav.params;
	var values = pav.values;
	if (action.suggestedNick) {
		params.push("suggestednick");
		values.push(action.suggestedNick);
	}
	if (action.auth && Object.keys(action.auth)[0]) {
		var a = Object.keys(action.auth)[0];
		params.push("authapp");
		params.push("authdata");
		values.push(a);
		values.push(action.auth[a]);
	}
	if (action.origin) {
		var list = ['gateway', 'client', 'server', 'domain', 'path'];
		list.forEach(function(p) {
			if (action.origin[p]) {
				params.push(p);
				values.push(action.origin[p]);
			}
		});

	}
	insert("session_actions", params, values);
}


function saveMembersAction(action) {
	var pav = getParamsAndValues(action);
	var params = pav.params;
	var values = pav.values;
	var list = ['text', 'ref', 'to', 'role', 'transitionRole', 'transitionType'];
	list.forEach(function(p) {
		if (action[p]) {
			params.push(p.toLowerCase());
			values.push(action[p]);
		}
	});
	if (action.transitionTime) {
		params.push("transitiontime");
		values.push(new Date(action.transitionTime).toISOString());
	}
	insert("member_actions", params, values);
}


function saveTextActions(action) {
	log("saving action", action);
	var pav = getParamsAndValues(action);
	var params = pav.params;
	var values = pav.values;
	params.push('text');
	values.push(action.text);
	params.push('gateway');
	values.push(action.session.split(":")[0]);
	params.push('to');
	values.push(action.to);
	if (action.ref) {
		params.push("ref");
		values.push(action.ref);
	}
	if (action.mentions) {
		params.push('mentions');
		values.push(action.mentions);
	}
	if (action.thread) {
		params.push('thread');
		params.push('threadtitles'); //threadTitles
		params.push('threadscores');
		var thread = [];
		var threadTitles = [];
		var threadScores = [];
		action.thread.forEach(function(th) {
			thread.push(th.id);
			threadTitles.push(th.title);
			threadScores.push(th.score);
		});
		values.push(thread);
		values.push(threadTitles);
		values.push(threadScores);
	}
	if (action.tags) {
		var tags = [];
		var labelScores = [];
		for (var l in action.tags) {
			if (action.tags.hasOwnProperty(l)) {
				tags.push(l);
				labelScores.push(action.tags[l]);
			}
		}
		params.push("tags");
		values.push("tags");
		params.push("labelscores");
		values.push(labelScores);
	}
	insert("text_actions", params, values);
}


function saveRoomUserActions(action) {
	log("saving action", action);
	var pav = getParamsAndValues(action);
	var params = pav.params;
	var values = pav.values;
	var type = action.type;
	params.push("creation");
	if (action.old && action.old.id) values.push(false);
	else values.push(true);
	params.push("description");
	values.push(action[type].description);
	params.push("to");
	values.push(action.to);
	var list = ['picture', 'timezone', 'identities'];
	list.forEach(function(p) {
		if (typeof action[type][p] !== 'undefined') {
			params.push(p);
			values.push(action[type][p]);
		}
	});
	params.push("params");
	values.push(JSON.stringify(action[type].params));
	params.push("guides");
	values.push(JSON.stringify(action[type].guides));
	insert("user_room_actions", params, values);
}

function getParamsAndValues(action) {
	var params = ['id', 'type', 'from', 'time', 'session', 'resource', 'success'];
	var values = [action.id, action.type, action.from, new Date(action.time).toISOString(), action.session, action.resource, true];
	return {
		params: params,
		values: values
	};
}


function insert(tableName, params, values) {
	var q = "INSERT INTO " + tableName + "(\"" + params.join("\",\"") + "\") values(";
	var no = [];
	for (var i = 1; i <= params.length; i++) {
		no.push("$" + i);
	}
	q += no.join(",") + ")";
	pg.connect(conString, function(err, client, done) {
		if (err) {
			log("Unable to get Pool Connection Object: ", err, q, values);
			return;
		}
		client.query(q, values, function(e, result) {
			if (e) log("Unable to run query: ", e, q, values, result);
			done();
		});
	});
}
