"use strict";
var log = require('../../lib/logger.js');
var pg = require("../../lib/pg.js");
// var userUtils = require("../../lib/user-utils.js");

module.exports = function (action) {
	var noteType, emptyObject = {}, insertObjects = [], insertIndex = {}, user;
//	log.d("Note action: ", action);
	if(action.type === "note" || action.type === "noted") {
		var notifyObject = {},
			whereObject = {};

		if(action.ref) { whereObject.ref = action.ref; }
		if(action.group) { whereObject.group = action.group; }
		if(action.notetype) { whereObject.notetype = action.notetype; }

//		if(action.readTime) { updateObject.readtime = new Date(action.readTime); }
//		if(action.dismissTime) { updateObject.dismisstime = new Date(action.dismissTime); }
//
//		if(!(Object.keys(updateObject).length)) return [];
		
		notifyObject[action.user.id] = null;
		
		return [pg.cat([
			{ $: "UPDATE \"notes\" SET \"notify\" = \"notify\" || ${notify} WHERE \"notify\" ? ${user}",
			  notify: notifyObject, user: action.user.id },
			pg.nameValues(whereObject, " AND "),
		], " AND ")];
	} else {
		if(!action.notify) { return []; }

		for (noteType in action.note) {
			insertIndex[noteType] = {
				ref: action.id,
				notetype: noteType,
				group: action.note[noteType].group,
				notify: {},
				time: new Date(action.time),
				notedata: action.note[noteType].noteData || emptyObject
			};
		}
		
//		action.occupants.forEach(function(e) {
//			occupants[e.id] = true;
//		});

		for(user in action.notify) {
//			console.log(user, action.notify[user]);
//			if (userUtils.isGuest(user)) continue;
//			if (occupants[user]) continue;
			for(noteType in action.notify[user]) {
				if (action.notify[user][noteType] < 40) continue;
				insertIndex[noteType].notify[user] = action.notify[user][noteType];
			}
		}
		
//		console.log(insertIndex);
		
		for(noteType in insertIndex) {
			if(Object.keys(insertIndex[noteType].notify).length) {
				insertObjects.push(insertIndex[noteType]);
			}
		}

		if(!insertObjects.length) return [];

		return [pg.insert("notes", insertObjects)];
	}
};
