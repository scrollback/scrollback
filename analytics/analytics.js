var core;
var config = require('../config.js');
var log  = require('../lib/logger.js');
var pg = require('pg');
var conString = "pg://" + config.pg.username + ":" +
	config.pg.password + "@" + config.pg.server + "/" + config.pg.db;
var textActions = ['text', 'edit'];
var occupantActions = ['back', 'away'];
var memberActions = ['join', 'part', 'admit', 'expel'];


module.exports = function(core) {
	textActions.forEach(function(type) {
		core.on(type, function(action, cb) {
			log("type:", action);
			saveTextActions(action);
			cb();
		}, "watcher");	
	});
	
	core.on('room', function(room, cb) {
		cb();
		saveRoomUserActions(room.room);
	}, "watcher");
	
	core.on('user', function(user, cb) {
		cb();
		saveRoomUserActions(user.user);
	}, "watcher");
	
	core.on('init', function(init, cb) {
		cb();
		saveSessionActions(init);
	}, "watcher");
	memberActions.forEach (function (ma) {
		core.on(ma, function(action, cb) {
			cb();
			saveMembersAction(action);
		}, "watcher");
	});
};

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
	var list = ['suggestedNick'];
	list.forEach(function(p) {
		if (action[p]) {
			params.push(p);
			values.push(action[p]);
		}
	});
	if (action.auth && Object.keys(action.auth)[0]) {
		var a = Object.keys(action.auth)[0];
		params.push("authApp");
		params.push("authData");
		values.push(a);
		values.push(action.auth[a]);
	}
	if (action.origin) {
		list = ['gateway', 'client', 'server', 'domain', 'path'];
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
			params.push(p);
			values.push(action[p]);
		}
	});
	if (action.transitionTime) {
		params.push(transitionTime);
		values.push(new Date(action.transitionTime));
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
	params.push('to');
	values.push(action.to);
	if (action.mentions) {
		params.push('mentions');
		values.push(action.mentions);
	}
	if (action.threads) {
		params.push('threads');
		params.push('threadTitles');
		params.push('threadScores');
		var threads = [];
		var threadTitles = [];
		var threadScores = [];
		action.threads.forEach(function(th) {
			threads.push(th.id);
			threadTitles.push(th.title);
			threadScores.push(th.score);
		});
		values.push(threads);
		values.push(threadTitles);
		values.push(threadScores);
	}
	if (action.labels) {
		var labels = [];
		var labelScores = [];
		for(var l in action.labels) {
			if (action.labels.hasOwnProperity(l)) {
				labels.push(l);
				labelScores.push(action.labels[l]);
			}
		}
		params.push(labels);
		values.push(labelScores);
	}
	insert("text_actions", params, values);
}


function saveRoomUserActions(action) {
	log("saving action", action);
	var pav = getParamsAndValues(action);
	var params = pav.params;
	var values = pav.values;
	params.push("creation");
	if (action.old.id) values.push(true);			
	else values.push(false);
	params.push("description");
	values.push(action.description);
	var list = ['picture', 'timezone', 'identities', 'to'];
	list.forEach(function(p) {
		if (action[p]) {
			params.push(p);
			values.push(action[p]);
		}
	});
	params.push("params");
	values.push(JSON.stringify(action.params));
	insert("user_room_actions", params, values);
}

function getParamsAndValues(action) {
	var params = ['id', 'type','from', 'time', 'session', 'resource', 'success' ];
	var values = [action.id, action.type, action.to, new Date(action.time), action.session, action.resource, true];
	return {
		params: params,
		values: values
	};
}


function insert(tableName, params, values) {
	var q = "INSERT INTO " + tableName + "(\"" + params.join("\",\"") + "\") values(";
	var no = [];
	for (var i = 1;i <= params.length;i++) {
		no.push("$"+i);
	}
	q += no.join(",") + ")";
	pg.connect(conString, function(err, client, done) {
		if (err) {
			log("Unable to get Pool Connection Object: ", err, q, values);
			return;
		}
		client.query(q, values, function(e, result) {
		log("Error:", e, " result: ", result);
			if (e) {
				log("Unable to run query: ", q, values);
			}
			done();	
		});
	});
}




