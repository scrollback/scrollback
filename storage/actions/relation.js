"use strict";

var pg = require("../../lib/pg.js");

module.exports = function (action) {
	var user, officer, object;
	
	if (action.type === 'admit' || action.type === 'expel') {
		officer = action.user.id;
		user = action.victim.id;
	} else {
		user = action.user.id;
		officer = null;
	}
	
	object = {
		room: action.room.id,
		user: user,
		role: action.role,
		transitionrole: action.transitionRole,
		transitiontype: action.transitionType,
		message: action.text,
		officer: officer,
		roletime: new Date(action.time)
	};
	
	return pg.upsert("relations", object, ["user", "room"]);
};
