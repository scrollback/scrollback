/* jshint browser: true */

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var ua = navigator.userAgent.toLowerCase(),
			env = (changes.context && changes.context.env) ? changes.context.env : store.get("context", "env"),
			cta = (changes.app && changes.app.cta) ? changes.app.cta : store.get("app", "cta");

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
