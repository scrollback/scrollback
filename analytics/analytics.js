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
	memberActions.forEach (function (ma) {
		core.on(ma, function(action, cb) {
			cb();
			saveMembersAction(action);
		}, "watcher");
	});
    occupantActions.forEach (function(a) {
        core.on(a, function(action, cb) {
            cb();
            saveOccupantAction(action);
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
	if(action.suggestedNick) {
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
	if (action.ref) {
		params.push("ref");
		values.push(action.ref);
	}
	if (action.mentions) {
		params.push('mentions');
		values.push(action.mentions);
	}
	if (action.threads) {
		params.push('threads');
		params.push('threadtitles');//threadTitles
		params.push('threadscores');
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
			if (action.labels.hasOwnProperty(l)) {
				labels.push(l);
				labelScores.push(action.labels[l]);
			}
		}
		params.push("labels");
		values.push(labels);
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
	var params = ['id', 'type', 'from', 'time', 'session', 'resource', 'success' ];
	var values = [action.id, action.type, action.from, new Date(action.time), action.session, action.resource, true];
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
			log(" result: ", result);
			if (e) log("Unable to run query: ", e, q, values);
			done();
		});
	});
}




