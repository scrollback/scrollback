"use strict";

var pg = require("../../lib/pg.js"),
	generate = require("../../lib/generate.js");


function getGroup(action) {
	switch(action.type) {
		case "text":
			return action.thread;
		default:
			return action.to;
	}
}

function getType(action, user) {
	switch(action.type) {
		default:
			return "default" || user;
	}
}

module.exports = function (action) {
	if(!action.notify) { return []; }
	
	var insertObjects = [], user;
	
	for(user in action.notify) {
		insertObjects.push({
			id: generate.uid(),
			user: user,
			action: action.type,
			noticetype: getType(action, user),
			ref: action.id,
			group: getGroup(action),
			score: action.notify[user],
			time: new Date(action.time)
		});
	}
	
	return [pg.insert("notices", insertObjects)];
};
