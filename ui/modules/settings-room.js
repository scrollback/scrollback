/* eslint-env browser */
/* global $ */

"use strict";

var objUtils = require("../../lib/obj-utils.js");

module.exports = function(core, config, store) {
	var renderSettings = require("../utils/render-settings.js")(core, config, store),
		saveInProgress = false;

	$(document).on("click", ".js-conf-save", function() {
		var self = $(this),
			roomName = store.get("nav", "room"),

			roomObj = objUtils.clone(store.getRoom(roomName));

		self.addClass("working");

		core.emit("conf-save", roomObj, function(err, room) {
			core.emit("room-up", {
				to: roomName,
				room: room
			}, function(e, r) {
				self.removeClass("working");

				if (e) {
					$("<div>").html("Sorry! Could not save your settings. Please try again.").
					alertbar({
						type: "error"
					});
				} else {
					for (var i in r.room.params) {
						if (!r.room.params.hasOwnProperty(i)) {
							continue;
						}

						if (r.room.params[i].error) {
							return;
						}
					}

					saveInProgress = true;

					core.emit("setstate", {
						nav: {
							dialog: null
						}
					});
				}
			});
		});
	});

	core.on("error-dn", function(err) {
		if (err.actionType === "room") {
			saveInProgress = false;
		}
	});

	core.on("room-dn", function(room, next) {
		var user = store.get("user");
		if (room.user.id === user && saveInProgress && Object.keys(room.old).length !== 0) {
			saveInProgress = false;
			$("<div>").html("Your room settings were successfully saved.").
			alertbar({
				type: "info",
				timeout: 1500
			});

		}
		next();
	}, 500);

	core.on("conf-dialog", function(dialog, next) {
		var rel = store.getRelation();

		if (!rel || (rel && rel.role !== "owner")) {
			// Don't proceed
			return;
		}

		core.emit("conf-show", {
			room: objUtils.clone(store.getRoom())
		}, function(err, items) {
			dialog.element = renderSettings(items);

			next();
		});
	}, 500);
};
