/* jshint browser: true */

"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var colordiv;

	core.on("boot", function(state) {
		if (window.Android) {
			state.context.env = "android";

			if (typeof window.Android.onFinishedLoading === "function") {
				window.Android.onFinishedLoading();
			}
		}
	}, 200);

	core.on("setstate", function(changes) {
		var future = store.with(changes),
			user = future.get("user"),
			dialog = future.get("nav", "dialog"),
			env = future.get("context", "env");

		if (env === "android") {
			changes.nav = changes.nav || {};

			if (user && appUtils.isGuest(user)) {
				changes.nav.dialog = "signin";
				changes.nav.dialogState = changes.nav.dialogState || {};
				changes.nav.dialogState.mobileApp = true;
			} else if (dialog === "signin") {
				changes.nav.dialog = null;
				changes.nav.dialogState = null;
			}
		}
	}, 900);

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
				} else {
					window.Android.setStatusBarColor("#000000");
				}
			}
		}, 1);
	}
};
