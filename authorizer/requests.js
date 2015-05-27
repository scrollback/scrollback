/* global $, document*/
"use strict";
/*
var formField = require("../ui/utils/form-field.js"),
	handleAuthErrors = require('./handleAuthErrors.js');
*/

module.exports = function(core, config, store) {
	core.on('conf-show', function(tabs, next) {
		var relatedUsers = store.getRelatedUsers(tabs.room.id);

		var users = relatedUsers.filter(function(user) {
			return user.transitionType === 'request';
		});
		var div = $('<div>'),
			items = [];
		users.forEach(function(user) {
			var element = $("<div>").text(user.id + " has requested to be " + user.transitionRole);

			var button = $("<button>Approve</button>");
			button.data("room", tabs.room.id);
			button.data("user", user.id);
			button.addClass("auth-admit");
			element.append(button);
			items.push(element);
		});

		div.append.apply(div, items);
		tabs.requests = {
			html: div,
			text: "Requests"
		};

		next();
	}, 700);


	$(document).on('click', '.auth-admit', function(e) {
		var element = e.target;
		var room = $(element).data("room"),
			user = $(element).data("user");
		core.emit("admit-up", {
			to: room,
			ref: user,
			role: 'follower'
		});
	});
};
