/* eslint-env es6, browser */

"use strict";

module.exports = () => {
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

	function onReady(e) {
		if (e.origin !== window.location.origin) {
			return;
		}

		let message = e.data,
			data;

		if (typeof message === "string") {
			try {
				data = JSON.parse(message);
			} catch (err) {
				return;
			}
		} else if (typeof message === "object" && message) {
			data = message;
		}

		if (data && data.type === "ready") {
			if (typeof window.Android.onFinishedLoading === "function") {
				window.Android.onFinishedLoading();
			}

			window.removeEventListener("message", onReady);
		}
	}

	window.addEventListener("message", onReady);
};
