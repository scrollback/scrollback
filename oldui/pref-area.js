/* jshint browser: true */
/* global $ */

var renderSettings = require("./render-settings.js"),
	appUtils = require("../lib/appUtils.js");

module.exports = function(core, config, store) {
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
		var user = store.getUser;

		if (!user || appUtils.isGuest(user.id)) {
			// Don't proceed
			return;
		}

		user.params = user.params || {};
		user.guides = user.guides || {};

		core.emit("pref-show", { user: user }, function(err, items) {
			dialog.contents.push(renderSettings(items));

			next();
		});
	}, 500);

	core.on("user-menu", function(menu, next) {
		if (appUtils.isGuest(store.get("user"))) {
			return next();
		}

		menu.items.userpref = {
			text: "Account settings",
			prio: 300,
			action: function() {
				core.emit("setstate", {
					nav: {
						dialog: "pref"
					}
				});
			}
		};

		next();
	}, 1000);
};
