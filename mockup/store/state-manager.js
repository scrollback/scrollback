/* jshint browser: true */
/* global core, $ */

"use strict";

var keys = [ "view", "mode", "color" ],
    $title = $(".js-appbar-title"),
    $discussion = $(".js-discussion-title");

function buildIndex(state) {
	state.indexes = {
		userRooms: {},
		roomUsers: {}
	};

	if (state.relations && state.relations.length) {
		state.relations.forEach(function(relation) {
			state.entities[relation.room + "_" + relation.user] = relation;

			(state.indexes.userRooms[relation.user] = state.indexes.userRooms[relation.user] || []).push(relation);
			(state.indexes.roomUsers[relation.room] = state.indexes.roomUsers[relation.room] || []).push(relation);
		});
	}
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

// Listen to navigate and add class names
core.on("statechange", function(changes, next) {
    var classList = $("body").attr("class") || "";

    for (var i = 0, l = keys.length; i < l; i++) {
        if ([keys[i]] in changes.nav) {
            classList = classList.replace(new RegExp("\\b" + keys[i] + "-" + "\\S+", "g"), "");

            classList += " " + keys[i] + "-" + (changes.nav[keys[i]] || "");
        }
    }

    classList = classList.replace(/\bcolor-\S+/g, "").replace(/^\s+|\s+$/g, "");

    if ("nav" in changes && "mode" in changes.nav) {
        switch (changes.nav.mode) {
        case "room":
            $title.text(changes.nav.room);
            break;
        case "chat":
            classList += " color-" + changes.color;
            $title.text(changes.nav.room);
            $discussion.text(changes.nav.discussionId);
            break;
        case "home":
            $title.text("My feed");
            break;
        }
    }

    $("body").attr("class", classList);

    next();
}, 1000);

core.on("setstate", function(changes, next) {
	var state = window.currentState;

	buildIndex(changes);

	core.emit("statechange", changes, function() {
		var roomId = Object.keys(state.content)[0],
			threadId,
			threadRanges, textRanges;

		// merge state and changes
		extendObj(state, changes);

		if (roomId && changes.content) {
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
