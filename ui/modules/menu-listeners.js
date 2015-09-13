/* eslint-env browser */
/* global $ */

"use strict";

module.exports = core => {
	let menuShown = false;

	$(document).on("popoverInited popoverDismissed", (e, popover) => {
		if (/menu-[a-z\-]+/.test(popover.attr("class"))) {
			menuShown = (e.type === "popoverInited");
		}
	});

	core.on("statechange", changes => {
		if (menuShown && changes.nav && ("room" in changes.nav || "mode" in changes.nav || "view" in changes.nav)) {
			$.popover("dismiss");
		}
	}, 100);
};
