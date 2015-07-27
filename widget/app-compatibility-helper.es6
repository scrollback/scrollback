/* eslint-env es6, browser */

"use strict";

module.exports = core => {
	function onLogin(data) {
		if (data) {
			window.postMessage({
				type: "auth",
				provider: data.provider,
				token: data.token
			}, "*");
		}
	}

	window.addEventListener("login", e => onLogin(e.detail));

	function onChange(changes) {
		if (changes && changes.app && changes.app.bootComplete) {
			if (window.Android && typeof window.Android.onFinishedLoading === "function") {
				window.Android.onFinishedLoading();
			}

			core.off("statechange", onChange);
		}
	}

	core.on("statechange", onChange);
};
