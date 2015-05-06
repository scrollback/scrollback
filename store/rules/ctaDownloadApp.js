/* jshint browser: true */

"use strict";

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var ua = navigator.userAgent.toLowerCase(),
			future = store.with(changes),
			env = future.get("context", "env"),
			cta = future.get("app", "cta");

		changes.app = changes.app || {};

		// Show install app CTA on android devices
		if (ua && ua.indexOf("android") > -1 && env !== "android") {
			changes.app.cta = "androidapp";
		} else if (cta === "androidapp") {
			changes.app.cta = null;
		}

		next();
	}, 500);
};
