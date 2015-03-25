/* jshint browser: true */
/* global $ */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var keys = [ "view", "mode" ];

	// Listen to navigate and add class names
	core.on("statechange", function(changes, next) {
		var classList, relation, value, nav, thread, form, minimize,
			getClassList = function() {
				classList = ((typeof classList === "string") ? classList : $("body").attr("class")) || "";

				return classList;
			};

		if (changes.nav && ("view" in changes.nav || "mode" in changes.nav || "thread" in changes.nav)) {
			getClassList();

			nav = store.get("nav");

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
			getClassList();

			relation = store.getRelation();

			classList = classList.replace(/\brole-\S+/g, "").trim();

			if (relation && relation.role) {
				classList += " role-" + relation.role;
			} else {
				classList += " role-" + (appUtils.isGuest(store.get("user")) ? "guest" : "user" );
			}
		}

		if (store.get("context", "env") === "embed") {
			if (changes.context && changes.context.embed) {
				getClassList();

				form = store.get("context", "embed", "form");

				if ("form" in changes.context.embed) {
					classList = classList.replace(/\bembed-\S+/g, "").trim();

					if (form) {
						classList += " embed-" + form;
					}
				}

				if (form && "minimize" in changes.context.embed) {
					classList = classList.replace(form + "-minimized", "").trim();

					minimize = store.get("context", "embed", "minimize");

					if (minimize) {
						classList += " " + form + "-minimized";
					}
				}
			}
		}

		if (typeof classList === "string") {
			$("body").attr("class", classList);
		}

		next();
	}, 1000);
};
