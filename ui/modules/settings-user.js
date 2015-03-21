/* jshint browser: true */
/* global $ */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var renderSettings = require("../utils/render-settings.js")(core, config, store);

	$(document).on("click", ".js-pref-save", function() {
		var self = $(this),
			currentUser = store.getUser(),
			userObj = {
				id: currentUser.id,
				description: "",
				identities: currentUser.identities || [],
				params: currentUser.params || {},
				guides: currentUser.guides || {}
			};

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

		if (!user || appUtils.isGuest(user.id)) {
			// Don't proceed
			return;
		}

		user.params = user.params || {};
		user.guides = user.guides || {};

		core.emit("pref-show", { user: user }, function(err, items) {
			dialog.element = renderSettings(items);

			next();
		});
	}, 500);

	core.on("user-menu", function(menu, next) {
		var user = store.getUser(),
			notification = (user.params.notifications && typeof user.params.notifications.sound == "boolean") ? user.params.notifications.sound : true;

		if (!appUtils.isGuest(store.get("user"))) {
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

		menu.items["sound-notification-" + (notification ? "disable" : "enable")] = {
			text: (notification ? "Disable " : "Enable ") + "sound notifications",
			prio: 500,
			action: function() {
				user.params.notifications = user.params.notifications || {};

				user.params.notifications.sound = !user.params.notifications.sound;

				core.emit("user-up", {
					to: user.id,
					from: user.id,
					user: user
				});
			}
		};

		if (appUtils.isGuest(store.get("user"))) {
			menu.title = "Sign in to Scrollback with";

			core.emit("auth", menu, function() {
				next();
			});
		}

		next();
	}, 1000);
};
