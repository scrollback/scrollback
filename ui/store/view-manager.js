/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var keys = [ "view", "mode", "color" ],
		$title = $(".js-appbar-title"),
		$thread = $(".js-thread-title");

	// Listen to navigate and add class names
	core.on("statechange", function(changes, next) {
		var classList = $("body").attr("class") || "",
			relation, value;

		for (var i = 0, l = keys.length; i < l; i++) {
			if ([keys[i]] in changes.nav) {
				classList = classList.replace(new RegExp("\\b" + keys[i] + "-" + "\\S+", "g"), "");

				value = store.getNav()[keys[i]];

				classList += value ? (" " + keys[i] + "-" + value) : "";
			}
		}

		classList = classList.replace(/\bcolor-\S+/g, "").replace(/^\s+|\s+$/g, "");

		if (changes.nav && changes.nav.mode) {
			switch (store.getNav().mode) {
			case "room":
				$title.text(store.getNav().room);
				break;
			case "chat":
				classList += " color-" + store.getNav().color;
				$title.text(store.getNav().room);
				$thread.text(store.getNav().threadId);
				break;
			case "home":
				$title.text("My feed");
				break;
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
