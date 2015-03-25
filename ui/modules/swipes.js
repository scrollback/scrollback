/* jshint browser: true */
/* global $ */

require("../../lib/swipe-events.js");

module.exports = function(core, config, store) {
	// Handle swipe gestures
	$(document).on("swipeleft", function() {
		var view = store.get("nav", "view");

		if ((view === "main" || !view) && /(room|chat)/.test(store.get("nav", "mode"))) {
			core.emit("setstate", {
				nav: { view: "sidebar-right" }
			});
		} else if (view === "sidebar-left") {
			core.emit("setstate", {
				nav: { view: null }
			});
		}
	});

	$(document).on("swiperight", function() {
		var view = store.get("nav", "view");

		if ((view === "main" || !view)) {
			core.emit("setstate", {
				nav: { view: "sidebar-left" }
			});
		} else if (view === "sidebar-right") {
			core.emit("setstate", {
				nav: { view: null }
			});
		}
	});
};
