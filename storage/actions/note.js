"use strict";
var log = require('../../lib/logger.js');
var pg = require("../../lib/pg.js");

module.exports = function (action) {
	var noteType, occupants = [];
	log.d("Note action: ", action);
	if(action.type === "note") {
		var updateObject = {},
			whereObject = { user: action.user.id };

		if(action.ref) { whereObject.ref = action.ref; }
		if(action.group) { whereObject.group = action.group; }
		if(action.notetype) { whereObject.notetype = action.notetype; }

		if(action.readTime) { updateObject.readtime = new Date(action.readTime); }
		if(action.dismissTime) { updateObject.dismisstime = new Date(action.dismissTime); }

		if(!(Object.keys(updateObject).length)) return;

		return [pg.cat([
			pg.update("notes", updateObject), // UPDATE notes SET readTime=${readTime}
			"WHERE",
			pg.nameValues(whereObject, " AND ") // user=${user} AND ref=${ref}
		])];
	} else {
		if(!action.notify) { return []; }

		var insertObjects = [], user;

		action.occupants.forEach(function(e) {
			occupants[e.id] = true;
		});

		for(user in action.notify) {
			for(noteType in  action.notify[user]) {
				if (occupants[user] && action.notify[user][noteType].score < 30) continue;

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

		if(!insertObjects.length) return [];

		return [pg.insert("notes", insertObjects)];
	}
};
