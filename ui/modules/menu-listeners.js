/* eslint-env browser */
/* global $ */

"use strict";

module.exports = function(core) {
	var menuShown = false;

	$(document).on("popoverInited popoverDismissed", function(e, popover) {
		if (/menu-[a-z\-]+/.test(popover.attr("class"))) {
			menuShown = (e.type === "popoverInited");
		}
	});

	core.on("statechange", function(changes) {
		if (menuShown && changes.nav && ("mode" in changes.nav || "view" in changes.nav)) {
			$.popover("dismiss");
		}
	}, 100);
};
