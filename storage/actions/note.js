"use strict";

var pg = require("../../lib/pg.js");

module.exports = function (action) {
	if(action.type === "note") {
		var updateObject = {
				user: action.user.id,
				action: action.action,
				group: action.group,
				notetype: action.noteType
			},
			whereFields = ["user", "action", "group", "notetype"];
		
		if(action.ref) { updateObject.ref = action.ref; whereFields.push("ref"); }
		if(action.readTime) { updateObject.readTime = new Date(action.time); }
		if(action.dismissTime) { updateObject.dismissTime = new Date(action.time); }
		
		return [pg.update("notes", updateObject, whereFields)];
	} else {
		if(!action.notify) { return []; }

		var insertObjects = [], user;

		for(user in action.notify) {
			insertObjects.push({
				user: user,
				action: action.type,
				ref: action.id,
				notetype: action.notify[user].noteType,
				group: action.note.group,
				score: action.notify[user].score,
				time: new Date(action.time),
				notedata: action.note.data || {}
			});
		}

		return [pg.insert("notes", insertObjects)];
	}
};
