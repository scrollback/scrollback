/* jshint browser: true */

"use strict";

module.exports = function(core) {
	var colordiv;

	core.on("boot", function(state) {
		if (window.Android) {
			state.context.env = "android";

			if (typeof window.Android.onFinishedLoading === "function") {
				window.Android.onFinishedLoading();
			}
		}
	}, 200);

	if (window.Android && typeof window.Android.setStatusBarColor === "function") {
		colordiv = document.createElement("div");

		colordiv.className = "thread-color-dark";

		document.body.appendChild(colordiv);

		core.on("statechange", function(changes) {
			var color;

			if (changes.nav && (changes.nav.mode || changes.nav.thread || changes.nav.room)) {
				color = window.getComputedStyle(colordiv)["background-color"];

				if (color) {
					window.Android.setStatusBarColor(color);
				}
			}
		}, 1);
	}
};
