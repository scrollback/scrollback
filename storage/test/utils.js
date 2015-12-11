/* eslint-env mocha */

var	crypto = require('crypto'),
	generate = require("../../lib/generate.js"),
	r = {},
	mathUtils = require('../../lib/math-utils.js');

r.getNewTextAction = function() {
	"use strict";
	var id = generate.uid();
	return {
		id: (id),
		type: "text",
		from: generate.names(6),
		to: generate.names(10),
		text: generate.sentence(10),
		tags: [],
		thread: generate.sentence(8),
		time: new Date().getTime()
	};
};

r.getNewUserAction = function() {
	"use strict";
	var email = generate.names(15) + "@" + generate.names(6) +"." + generate.names(2);
	return {
		id: generate.uid(),
		type: "user",
		user: {
			id: generate.names(8),
			description: generate.sentence(14),
			type: "user",
			timezone: mathUtils.random(-24, 24) * 30,
			picture: generatePick(email),
			identities: ["mailto:" + email],
			params: {},
			guides: {},
			createTime: new Date().getTime()
		},
		old: {},
		time: new Date().getTime()
	};
};

r.getNewRoomAction = function(){
"use strict";
	return {
		id: generate.uid(),
		type:"room",
		room: {
			id: generate.names(9),
			description: generate.sentence(10),
			type:"room",
			identities:[generate.names(6) + "://" + generate.names(10), generate.names(5) + "://" + generate.names(10)],
			params: {},
			guides: {},
			createTime: new Date().getTime()
		},
		time: new Date().getTime(),
		old: {}
	};
};


function generatePick(id) {
	"use strict";
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=identicon&s=48';
}


r.copy = function (action) {
	"use strict";
	return JSON.parse(JSON.stringify(action));
};

r.getNewRelationAction = function(type, userRole) {
	"use strict";
	var user = r.getNewUserAction().user;
	var room = r.getNewRoomAction().room;
	var victim;
	var from = user.id;
	if (type === 'admit' || type === 'expel') {
		victim = r.getNewUserAction().user;
	}
	var ret = {
		type: type,
		id: generate.uid(),
		role: userRole,
		to: room.id,
		victim: victim,
		from: from,
		session: generate.uid(),
		resource: generate.uid(),
		user: user,
		room: room,
		time: new Date().getTime()
	};
	return ret;
};

r.emitActions = function(core, actions, callback) {
	"use strict";
	var ct = 0;
	var error;
	var results = [];
	for (var j = 0; j < actions.length; j++) results.push(null);
	function done() {
		if (++ct === actions.length) callback(error, results);
	}

	function run(i) {
		core.emit(actions[i].type, actions[i], function(err, reply) {
			if (!err) {
				results[i] = reply;
				done();
			} else {
				error = err;
				done();
			}
		});
	}
	for (j = 0; j < actions.length; j++) {
		run(j);
	}

};

r.clearTables = function(client, tables, callback) {
	"use strict";
	var ct = 0;
	function done() {
		if (++ct >= tables.length) callback();
	}
	tables.forEach(function(table) {
		client.query("delete from " + table, function() {
			done();
		});
	});
};

module.exports = r;
