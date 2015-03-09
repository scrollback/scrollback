/* jshint browser: true */
/* global $ */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var keys = [ "view", "mode" ];

	// Listen to navigate and add class names
	core.on("statechange", function(changes, next) {
		var classList, relation, value, nav, thread;

		if (changes.nav && ("view" in changes.nav || "mode" in changes.nav || "thread" in changes.nav)) {
			classList = $("body").attr("class") || "";
			nav = store.getNav();

			for (var i = 0, l = keys.length; i < l; i++) {
				if (keys[i] in changes.nav) {
					classList = classList.replace(new RegExp("\\b" + keys[i] + "-" + "\\S+", "g"), "");

					value = nav[keys[i]];

					classList += value ? (" " + keys[i] + "-" + value) : "";
				}
			}

			classList = classList.replace(/\bcolor-\S+/g, "").replace(/^\s+|\s+$/g, "").trim();

			if (nav.mode === "chat" && nav.thread) {
				thread = store.get("indexes", "threadsById", nav.thread);

				if (thread) {
					classList += " color-" + thread.color;
				}
			}
		}

		if (changes.indexes && ("roomUsers" in changes.indexes || "userRooms" in changes.index)) {
			classList = ((typeof classList === "string") ? classList : $("body").attr("class")) || "";
			relation = store.getRelation();

			classList = classList.replace(/\brole-\S+/g, "").trim();

			if (relation && relation.role) {
				classList += " role-" + relation.role;
			} else {
				classList += " role-" + (appUtils.isGuest(store.get("user")) ? "guest" : "user" );
			}
		}

		if (typeof classList === "string") {
			$("body").attr("class", classList);
		}

		next();
	}, 1000);
};
