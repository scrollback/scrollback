/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var keys = [ "view", "mode" ];

	// Listen to navigate and add class names
	core.on("statechange", function(changes, next) {
		var classList = $("body").attr("class") || "",
			relation, value, nav, thread;

		if (changes.nav) {
			for (var i = 0, l = keys.length; i < l; i++) {
				if (keys[i] in changes.nav) {
					classList = classList.replace(new RegExp("\\b" + keys[i] + "-" + "\\S+", "g"), "");

					value = store.getNav()[keys[i]];

					classList += value ? (" " + keys[i] + "-" + value) : "";
				}
			}

			classList = classList.replace(/\bcolor-\S+/g, "").replace(/^\s+|\s+$/g, "");

		}

		nav = store.getNav();

		if (changes.nav && nav.mode === "chat" && nav.thread) {
			thread = store.get("indexes", "threadsById", nav.thread);

			if (thread) {
				classList += " color-" + thread.color;
			}
		}

		if (changes.indexes && ("roomUsers" in changes.indexes || "userRooms" in changes.index)) {
			relation = store.getRelation();

			classList = classList.replace(/\brole-\S+/g, "");

			if (relation && relation.role) {
				classList += " role-" + relation.role;
			}
		}

		$("body").attr("class", classList);

		next();
	}, 1000);
};
