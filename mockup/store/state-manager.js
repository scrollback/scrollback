/* jshint browser: true */
/* global core */

"use strict";

function buildIndex(state) {
	state.indexes = {
		userRooms: {},
		roomUsers: {}
	};

	state.relations.forEach(function(relation) {
		state.entities[relation.room + "_" + relation.user] = relation;

		(state.indexes.userRooms[relation.user] = state.indexes.userRooms[relation.user] || []).push(relation);
		(state.indexes.roomUsers[relation.room] = state.indexes.roomUsers[relation.room] || []).push(relation);
	});
}

function extendObj(obj1, obj2) {
	if (typeof obj1 !== "object" || typeof obj2 !== "object") {
		throw new Error("Invalid parameters passed");
	}

	for (var name in obj2) {
		if (obj2[name] === null) {
			delete obj1[name];
		} else if (typeof obj1[name] === "object" && typeof obj2[name] === "object" && obj1[name] !== null) {
			extendObj(obj1[name], obj2[name]);
		} else {
			obj1[name] = obj2[name];
		}
	}

	return obj1;
}

core.on("setstate", function(changes, next) {
	var state = window.currentState;

	buildIndex(changes);

	core.emit("statechange", changes, function() {
		var roomId = Object.keys(changes.content)[0],
			threadId,
			threadRanges, textRanges;

		// merge state and changes
		extendObj(state, changes);

		if (roomId) {
			textRanges = changes.content[roomId].textRanges;
			threadRanges = changes.content[roomId].threadRanges;

			if (textRanges) {
				threadId = Object.keys(textRanges)[0];

				textRanges[threadId][0].items.push(textRanges[threadId][0].items[0]);
			}

			if (threadRanges) {
				threadRanges[0].items.push(threadRanges[0].items[0]);
			}
		}

		buildIndex(state);
	});

	next();
}, 1000);
