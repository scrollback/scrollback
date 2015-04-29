/* global $ */

module.exports = function(core, config, store) {
	var menuShown = false;

	$(document).on("popoverInited popoverDismissed", function(e, popover) {
		if (/menu-[a-z\-]+/.test(popover.attr("class"))) {
			menuShown = (e.type === "popoverInited");
		}
	});

	core.on("statechange", function(changes, next) {
		if (menuShown && changes && "nav" in changes) {
			$.popover("dismiss");
		}

		next();
	}, 100)
}
