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
		var rel = store.getRelation();

		if (rel && rel.role === "owner") {
			return next();
		}

		menu.items.userpref = {
			text: "Configure room",
			prio: 300,
			action: function() {
				core.emit("setstate", {
					nav: {
						dialog: "conf"
					}
				});
			}
		};

		next();
	}, 1000);
};
