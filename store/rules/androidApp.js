/* eslint-env browser */

"use strict";

module.exports = function(core) {
	var colordiv;

	function rgb2hex(color) {
		var rgb, r, g, b;

		rgb = color.replace(/^rgba?\(|\)$]/g, "").split(",");

		r = ("0" + parseInt(rgb[0], 10).toString(16)).slice(-2);
		g = ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2);
		b = ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2);

		return "#" + r + g + b;
	}

	function setStatusBarColor() {
		var color = window.getComputedStyle(colordiv)["background-color"];

		if (color) {
			window.Android.setStatusBarColor(rgb2hex(color));
		} else {
			window.Android.setStatusBarColor("#000000");
		}
	}

	core.on("boot", function() {
		if (window.Android) {
			
			// Deprecation notice: This is replaced with postMessage(ready).
			if (typeof window.Android.onFinishedLoading === "function") {
				window.Android.onFinishedLoading();
			}

			setStatusBarColor();
		}
	}, 200);

	if (window.Android && typeof window.Android.setStatusBarColor === "function") {
		colordiv = document.createElement("div");

		colordiv.className = "thread-color-dark";

		document.body.appendChild(colordiv);

		core.on("statechange", function(changes) {
			if (changes.nav && ("mode" in changes.nav || "thread" in changes.nav || "room" in changes.nav)) {
				setStatusBarColor();
			}
		}, 1);
	}
};
