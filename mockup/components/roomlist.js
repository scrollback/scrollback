/* jshint browser: true */
/* global core */

"use strict";

var View = require("../views/view.js"),
	Card = require("../views/card.js"),
	Roomcard = require("../views/roomcard.js"),
	roles = {
		"visitor": "Recently visited",
		"owner": "My rooms",
		"member": "Following"
	},
	sections = {},
    roomlist;

roomlist = (function() {
    var grid = new View({ type: "grid" }),
        list = new View({ type: "list" }),
        rooms = {};

    grid.element.appendTo(".main-content-rooms");
    list.element.appendTo(".room-list");

	return {
		addHeader: function(title) {
			return [ grid.addHeader(title), list.addHeader(title) ];
		},
		addItem: function(roomObj, secs) {
			var cards = [ (new Roomcard(roomObj)), (new Card(roomObj, "room")) ];

			rooms[roomObj.id] = [
	            grid.addItem(cards[0].element, secs[0]),
	            list.addItem(cards[1].element, secs[1])
            ];
		},
		getItem: function(roomObj) {
			var items = rooms[roomObj.id];

			if (!(items && items instanceof Array)) {
				return [];
			}

			return [ grid.getItem(items[0]), grid.getItem(items[1]) ];
		},
		updateItem: function(roomObj) {
			var cards = this.getItem[roomObj];

			for (var i = 0, l = cards.length; i < l; i++) {
				cards[i].updateCard(roomObj);
			}
		},
		removeItem: function(roomObj) {
			var cards = this.getItem[roomObj];

			for (var i = 0, l = cards.length; i < l; i++) {
				cards[i].element.remove();
			}

			delete rooms[roomObj.id];
		}
	};
}());

for (var role in roles) {
	sections[role] = roomlist.addHeader(roles[role]);
}

core.on("statechange", function(changes, next) {
	var user = window.currentState.user,
		roomRel, roomObj, rooms;

	if ("indexes" in changes && "userRooms" in changes.indexes && user in changes.indexes.userRooms) {
		for (var room in changes.indexes.userRooms[user]) {
			roomRel = changes.indexes.userRooms[user][room];
			roomObj = changes.entities[roomRel.room];
			rooms = roomlist.getItem(roomObj);

			if (roomObj === null) {
				roomlist.remove({ id: roomRel.room });
			}

			if (rooms.length) {
				roomlist.updateItem(roomObj, sections[roomRel.role]);
			} else {
				roomlist.addItem(roomObj, sections[roomRel.role]);
			}
		}
	}

	next();
}, 500);

