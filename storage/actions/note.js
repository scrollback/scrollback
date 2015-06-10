"use strict";

var pg = require("../../lib/pg.js");

module.exports = function (action) {
	var noteType;
	console.log("notes2: wooo2", action);
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
		console.log("notes2: wooo3");


		for(user in action.notify) {
			for(noteType in  action.notify[user]) {
				insertObjects.push({
					user: user,
					action: action.type,
					ref: action.id,
					notetype: noteType,
					group: action.note[noteType].group,
					score: action.notify[user][noteType].score,
					time: new Date(action.time),
					notedata: action.note[noteType].noteData || {}
				});	
			}
		}	
		
		console.log("Insert objects", insertObjects);

		return [pg.insert("notes", insertObjects)];
	}
};
