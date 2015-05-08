/* eslint-env browser */

"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var keys = [ "view", "mode" ],
		types = [ "view", "mode", "color", "role", "embed", "toast", "canvas", "input", "state" ],
		oldClassName;

	// Listen to navigate and add class names
	core.on("statechange", function() {
		var newClassList = [],
			currentClassName, newClassName,
			relation, value, nav, thread, form, minimize;

		nav = store.get("nav");

		for (var i = 0, l = keys.length; i < l; i++) {
			value = nav[keys[i]];

			if (value) {
				newClassList.push(keys[i] + "-" + value);
			}
		}

		if (nav.mode === "chat" && nav.thread) {
			thread = store.get("indexes", "threadsById", nav.thread);

			if (thread && thread.color) {
				newClassList.push("color-" + thread.color);
			}
		}

		relation = store.getRelation();

		if (relation && relation.role) {
			newClassList.push("role-" + relation.role);
		} else {
			newClassList.push("role-" + (appUtils.isGuest(store.get("user")) ? "guest" : "user"));
		}

		if (store.get("context", "env") === "embed") {
			form = store.get("context", "embed", "form");

			if (form) {
				newClassList.push("embed-" + form);
			}

			minimize = store.get("context", "embed", "minimize");

			if (minimize) {
				newClassList.push(form + "-minimized");
			}
		}

		if (store.get("app", "focusedInput")) {
			newClassList.push("input-focused");
		}

		newClassList.push("state-" + store.get("app", "connectionStatus"));

		// Sort and join class names for comparison
		newClassName = newClassList.sort().join(" ");

		// Compare with old class name
		if (oldClassName !== newClassName) {
			currentClassName = document.body.className;

			for (var j = 0, k = types.length; j < k; j++) {
				currentClassName = currentClassName.replace(new RegExp("\\b" + types[j] + "-" + "\\S+", "g"), "").trim();
			}

			document.body.className = newClassName + " " + currentClassName;

			// Store the old class name
			oldClassName = newClassName;
		}
	}, 1);
};
