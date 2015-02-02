/* jshint browser: true */
/* global core */

var View = require("../views/view.js"),
	Card = require("../views/card.js"),
	discussion;

discussion = (function() {
	var grid = new View({ type: "grid" }),
		cards = {},
		threads = {};

	grid.addHeader("Discussions");
	grid.element.appendTo(".main-content-discussions");

	return {
		addItem: function(thread) {
			cards[thread.id] = new Card(thread, "discussion");

			threads[thread.id] = grid.addItem(cards[thread.id].element, null, "start");

			return threads[thread.id];
		},

		getItem: function(thread) {
			return grid.getItem(threads[thread.id]);
		},

		removeItem: function(thread) {
			var item = this.getItem(thread);

			grid.removeItem(item);

			delete cards[thread.id];
			delete threads[thread.id];
		},

		getCard: function(thread) {
			return cards[thread.id];
		},

		updateCard: function(thread) {
			cards[thread.id].updateCard(thread);
		},

		addMessage: function(thread, message) {
			cards[thread.id].addMessage(message);
		}
	};
}());

core.on("statechange", function(changes, next) {
	var room = window.currentState.nav.room,
		items;

	if ("content" in changes && room in changes.content) {
		if ("threadRanges" in changes.content[room] && "items" in changes.content[room].threadRanges[0]) {
			items = changes.content[room].threadRanges[0].items;

			for (var i = 0, l = items.length; i < l; i++) {
				discussion.addItem(items[i]);
			}
		}
	}

	next();
}, 500);
