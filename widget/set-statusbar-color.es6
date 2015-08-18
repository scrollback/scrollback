/* eslint-env es6, browser */

"use strict";

const Color = require("pigment/basic");

module.exports = core => {
	let colordiv;

	function setStatusBarColor() {
		let color = window.getComputedStyle(colordiv)["background-color"],
			hex;

		try {
			hex = new Color(color).tohex();
		} catch (e) {
			console.warn("Failed to parse color", color, e);
		}

		if (hex) {
			window.Android.setStatusBarColor(hex);
		} else {
			window.Android.setStatusBarColor("#000000");
		}
	}

	if (window.Android && typeof window.Android.setStatusBarColor === "function") {
		colordiv = document.createElement("div");

		colordiv.className = "thread-color-dark";

		document.body.appendChild(colordiv);

		core.on("statechange", changes => {
			if (changes.app && changes.app.bootComplete ||
			    changes.nav && ("mode" in changes.nav || "thread" in changes.nav || "room" in changes.nav)) {
				setStatusBarColor();
			}
		}, 1);
	}
};
