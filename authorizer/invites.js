/* global $, document */
"use strict";
//var handleAuthErrors = require('./handleAuthErrors.js');

module.exports = function(core, config, store) {
	core.on("pref-show", function(tabs) {
		var relatedRooms = store.getRelatedRooms();
		var div = $('<div>'), items = [];
		relatedRooms.forEach(function(room) {
			var element = $("<div>").text("invitation to be "+room.transitionRole+" in " + room.id);
			var button = $("<button>Approve</button>");
			button.data("room", room.id);
			button.addClass("auth-join");
			element.append(button);
			items.push(element);
		});
		
		div.append.apply(div, items);
		tabs.requests = {
			html: div,
			text: "Requests"
		};
	}, 800);
		
	$(document).on('click', '.auth-join', function(e) {
		var element = e.target;
		var room = $(element).data("room");
		core.emit("join", {to:room, role:'follower'});
	});
};
