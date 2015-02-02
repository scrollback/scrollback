/* jshint browser: true */
/* global core, $ */

var View = require("../views/view.js"),
	list = new View({ type: "list" }),
	online = list.addHeader("Online"),
	offline = list.addHeader("Offline"),
	users = {},
	people;

people = {
	addItem: function(user, section) {
		users[user.id] = list.addItem($('<div class="people-list-item">').append(
	                        $('<img class="people-list-item-avatar">').attr("src", user.picture),
	                        $('<span class="people-list-item-nick">').text(user.id)
	                     ), section, "start");

		return users[user.id];
	},

	removeItem: function(user) {
		list.removeItem(users[user.id]);

		delete users[user.id];
	}
};

list.element.appendTo(".people-list");

core.on("statechange", function(changes, next) {
	var room = window.currentState.nav.room,
		userRel, userObj;

	if ("indexes" in changes && "roomUsers" in changes.indexes && room in changes.indexes.roomUsers) {
		for (var user in changes.indexes.roomUsers[room]) {
			userRel = changes.indexes.roomUsers[room][user];
			userObj = changes.entities[userRel.user];

			if (userRel.user === null) {
				people.removeItem(userObj);
			} else {
				if (userRel.status === "online") {
					people.addItem(userObj, online);
				} else {
					people.addItem(userObj, offline);
				}
			}
		}
	}

	next();
}, 500);
