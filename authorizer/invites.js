/* global $, document */
"use strict";

module.exports = function(core, config, store) {
	core.on("pref-show", function(tabs) {
		var relatedRooms = store.getRelatedRooms();
		var div = $('<div>'),
			items = [];
		relatedRooms.forEach(function(room) {
			var element, button;
			if(room.transitionType !== "invite") return;
			
			element = $("<div>").text("invitation to be " + room.transitionRole + " in " + room.id);
			button = $("<button>Approve</button>");
			button.data("room", room.id);
			button.data("role", room.transitionRole);
			
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
		var role = $(element).data("role");
		core.emit("join-up", {
			to: room,
			role: role
		});
	});
};
