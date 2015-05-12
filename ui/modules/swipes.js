/* eslint-env browser */
/* global $ */

"use strict";

require("../../lib/swipe-events.js");

module.exports = function(core, config, store) {
	// Handle swipe gestures
	$(document).on("swipeleft", function() {
		var view = store.get("nav", "view");

		if (view !== "sidebar-right" && /(room|chat)/.test(store.get("nav", "mode"))) {
			core.emit("setstate", {
				nav: { view: "sidebar-right" }
			});
		}
	});

	$(document).on("swiperight", function() {
		var view = store.get("nav", "view");

		if (view === "sidebar-right") {
			core.emit("setstate", {
				nav: { view: null }
			});
		}
	});
};
