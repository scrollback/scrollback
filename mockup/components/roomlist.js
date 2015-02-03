/* jshint browser: true */
/* global core, $ */


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
        cards = {},
        rooms = {};

    grid.element.appendTo(".main-content-rooms");
    list.element.appendTo(".room-list");

	return {
		addHeader: function(title) {
			return [ grid.addHeader(title), list.addHeader(title) ];
		},

		addItem: function(roomObj, secs) {
			cards[roomObj.id] = [ (new Roomcard(roomObj)), (new Card(roomObj, "room")) ];

			rooms[roomObj.id] = [
	            grid.addItem(cards[roomObj.id][0].element, secs[0], "start"),
	            list.addItem(cards[roomObj.id][1].element, secs[1], "start")
            ];
		},

		getItem: function(roomObj) {
			var items = rooms[roomObj.id];

			if (!(items && items instanceof Array)) {
				return [];
			}

			return [ grid.getItem(items[0]), grid.getItem(items[1]) ];
		},

		removeItem: function(roomObj) {
			var items = this.getItem[roomObj];

            grid.removeItem(items[0]);
            list.removeItem(items[1]);

			delete cards[roomObj.id];
			delete rooms[roomObj.id];
		},

		getCards: function(roomObj) {
			var items = cards[roomObj.id];

			if (!(items && items instanceof Array)) {
				return [];
			}

			return items;
		},

		updateCards: function(roomObj) {
			var items = this.getCards[roomObj];

            items[0].updateCard(roomObj);
            items[1].updateCard(roomObj);
		}
	};
}());

for (var role in roles) {
	sections[role] = roomlist.addHeader(roles[role]);
}

core.on("statechange", function(changes, next) {
	var user = window.currentState.user,
		room, roomRel, roomObj, rooms, items, cards;

	if ("indexes" in changes && "userRooms" in changes.indexes && user in changes.indexes.userRooms) {
		for (room in changes.indexes.userRooms[user]) {
			roomRel = changes.indexes.userRooms[user][room];
			roomObj = changes.entities[roomRel.room];
			rooms = roomlist.getItem(roomObj);

			if (roomObj === null) {
				roomlist.remove({ id: roomRel.room });
			}

			if (rooms.length) {
				roomlist.updateCards(roomObj);
			} else {
				roomlist.addItem(roomObj, sections[roomRel.role]);
			}
		}
	}

	if ("content" in changes) {
		for (room in changes.content) {
			roomObj = changes.entities[room];

			if ("threadRanges" in changes.content[room] && "items" in changes.content[room].threadRanges[0]) {
				items = changes.content[room].threadRanges[0].items;

				for (var i = 0, l = items.length; i < l; i++) {
					cards = roomlist.getCards(roomObj);

					if (cards.length) {
						cards[0].addThread(items[i]);
					}
				}
			}
		}
	}

	next();
}, 500);


$(document).on("click", ".js-room-card", function(e) {
    if ($(e.target).closest(".js-room-more").length) {
        return;
    }

    core.emit("setstate", {
        nav: {
            mode: "room",
            roomName: $(this).attr("data-room"),
            view: null
        }
    });
});

$(".js-goto-room").on("click", function() {
    core.emit("setstate", {
        nav: {
            mode: "room",
            view: null
        }
    });
});
