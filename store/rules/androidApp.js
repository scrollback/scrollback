/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js"),
	colors = [];

document.addEventListener("readystatechange", function() {
	var testDiv, color, rgb;

	// Get thread colors
	if (document.readyState === "complete") {
		testDiv = document.createElement("div");

		document.body.appendChild(testDiv);

		for (var i = 0; i < 9; i++) {
			testDiv.className = "test-thread-color-dark-" + i;

			color = getComputedStyle(testDiv).backgroundColor;

			if (typeof color === "string") {
				rgb = color.match(/\d+/g);

				colors.push("#" + parseInt(rgb[0]).toString(16) + parseInt(rgb[1]).toString(16) + parseInt(rgb[2]).toString(16));
			}

		}

		document.body.removeChild(testDiv);
	}
}, false);

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			env = future.get("context", "env"),
			user, dialog, mode, thread, index, color;

		if (env === "android") {
			user = future.get("user");
			dialog = future.get("nav", "dialog");

			changes.nav = changes.nav || {};

			if (user && appUtils.isGuest(user)) {
				changes.nav.dialog = "signin";
				changes.nav.dialogState = changes.nav.dialogState || {};
				changes.nav.dialogState.mobileApp = true;
			} else if (dialog === "signin") {
				changes.nav.dialog = null;
				changes.nav.dialogState = null;
			}

			if (typeof window.Android.setStatusBarColor === "function") {
				if (changes.nav && ("mode" in changes.nav || "thread" in changes.nav)) {
					mode = future.get("nav", "mode");

					if (mode === "chat") {
						thread = store.get("indexes", "threadsById", store.get("nav", "thread"));

						if (thread) {
							index = parseInt(thread.color);

							if (!isNaN(index)) {
								color = colors[index];
							}
						}
					}

					if (color && typeof color === "string") {
						window.Android.setStatusBarColor(color);
					} else {
						window.Android.setStatusBarColor();
					}
				}
			}
		}

		next();
	}, 900);
};
