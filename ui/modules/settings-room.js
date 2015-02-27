/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var renderSettings = require("../utils/render-settings.js")(core, config, store);

	$(document).on("click", ".js-conf-save", function() {
		var self = $(this),
			roomName = store.getNav().room,
			roomObj = {
				id: roomName,
				description: "",
				identities: [],
				params: {},
				guides: {}
			};

		self.addClass("working");

		core.emit("conf-save", roomObj, function(err, room) {
			core.emit("room-up", {
				to: roomName,
				room: room
			 }, function(err, room) {
				self.removeClass("working");

				if (err) {
					// handle the error
				} else {
					for (var i in room.room.params) {
						if (!room.room.params.hasOwnProperty(i)) {
							continue;
						}

						if (room.room.params[i].error) {
							return;
						}
					}

					core.emit("setstate", {
						nav: {
							dialog: null
						}
					});
				}
			});
		});
	});

	core.on("conf-dialog", function(dialog, next) {
		var rel = store.getRelation();

		if (!rel || (rel && rel.role !== "owner")) {
			// Don't proceed
			return;
		}

		core.emit("conf-show", { room: store.getRoom() }, function(err, items) {
			dialog.element = renderSettings(items);

			next();
		});
	}, 500);

	core.on("room-menu", function(menu, next) {
		var rel = store.getRelation(menu.room);

		if (!rel) {
			return next();
		}

		if (/(owner|moderator)/.test(rel.role)) {
			menu.items.configure = {
				text: "Configure room",
				prio: 300,
				action: function() {
					core.emit("setstate", {
						nav: {
							room: menu.room,
							dialog: "conf"
						}
					});
				}
			};
		}

		if (rel.role === "follower") {
			menu.items.unfollow = {
				text: "Unfollow room",
				prio: 300,
				action: function() {
					core.emit("part-up", { room: menu.room });
				}
			};
		}

		if (rel.role === "visitor") {
			menu.items.follow = {
				text: "Follow room",
				prio: 300,
				action: function() {
					core.emit("join-up", { room: menu.room });
				}
			};
		}

		next();
	}, 500);
};
