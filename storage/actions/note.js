"use strict";

var pg = require("../../lib/pg.js");

module.exports = function (action) {
	var noteType;
	if(action.type === "note") {
		var updateObject = {
				user: action.user.id
			},
			whereFields = ["user", "action", "group", "notetype"];
		
		if(action.ref) { updateObject.ref = action.ref; whereFields.push("ref"); }
		if(action.group) { updateObject.group = action.group; whereFields.push("group"); }
		if(action.notetype) { updateObject.notetype = action.notetype; whereFields.push("notetype"); }
		if(action.readTime) { updateObject.readTime = new Date(action.time); }
		if(action.dismissTime) { updateObject.dismissTime = new Date(action.time); }
		
		return [pg.update("notes", updateObject, whereFields)];
	} else {
		if(!action.notify) { return []; }

		var insertObjects = [], user;


		for(user in action.notify) {
			for(noteType in  action.notify[user]) {
				insertObjects.push({
					user: user,
					action: action.type,
					ref: action.id,
					notetype: noteType,
					group: action.note[noteType].group,
					score: action.notify[user][noteType],
					time: new Date(action.time),
					notedata: action.note[noteType].noteData || {}
				});	
			}
		}	
		return [pg.insert("notes", insertObjects)];
	}
};
