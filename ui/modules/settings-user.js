/* jshint browser: true */
/* global $ */

var objUtils = require("../../lib/obj-utils.js"),
	appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var renderSettings = require("../utils/render-settings.js")(core, config, store);

	$(document).on("click", ".js-pref-save", function() {
		var self = $(this),
			userObj = objUtils.clone(store.getUser());

		self.addClass("working");

		core.emit("pref-save", userObj, function(err, user) {
			core.emit("user-up", {
				to: user.id,
				user: user
			}, function() {
				self.removeClass("working");

				core.emit("setstate", {
					nav: {
						dialog: null
					}
				});
			});
		});
	});

	core.on("pref-dialog", function(dialog, next) {
		var user = store.getUser();

		if (!(user && user.id) || appUtils.isGuest(user.id)) {
			// Don't proceed
			return;
		}

		user.params = user.params || {};
		user.guides = user.guides || {};

		core.emit("pref-show", { user: objUtils.clone(user) }, function(err, items) {
			dialog.element = renderSettings(items);

			next();
		});
	}, 500);

	core.on("user-menu", function(menu, next) {
		var userObj = store.getUser(),
			sound = (userObj.params.notifications && typeof userObj.params.notifications.sound === "boolean") ? userObj.params.notifications.sound : true;

		if (userObj && !appUtils.isGuest(userObj.id)) {
			menu.items.userpref = {
				text: "Account settings",
				prio: 300,
				action: function() {
					core.emit("setstate", {
						nav: { dialog: "pref" }
					});
				}
			};
		}

		menu.items["sound-notification-" + (sound ? "disable" : "enable")] = {
			text: (sound ? "Disable " : "Enable ") + "sound notifications",
			prio: 500,
			action: function() {
				var newUserObj = objUtils.clone(userObj);

				newUserObj.params.notifications = newUserObj.params.notifications || {};
				newUserObj.params.notifications.sound = !sound;

				core.emit("user-up", {
					to: newUserObj.id,
					user: newUserObj
				});
			}
		};

		if (userObj && appUtils.isGuest(userObj.id)) {
			menu.title = "Sign in to Scrollback with";

			core.emit("auth", menu, function() {
				next();
			});
		}

		next();
	}, 1000);
};
