/* global $ */

module.exports = function(core, config, store) {
	function updateNotifier(roomName, type) {
		var $roomItem = $("[data-room='" + roomName + "']"),
			$badge = $roomItem.find(".js-room-notifications-counter"),
			counter;

		if (!($roomItem.length && $badge.length)) {
			return;
		}

		if (type === "remove") {
			$badge.removeClass("mentioned").text("");

			return;
		}

		// There might be multiple badges in the DOM
		// We need to find the counter from the correct badge

		for (var i = 0, l = $badge.length; i < l; i++) {
			counter = parseInt($badge.eq(i).text(), 10) || 0;

			if (counter) {
				break;
			}
		}

		counter++;

		if (counter) {
			$badge.text(counter);
		}

		if (type) {
			$badge.addClass(type);
		}
	}

	core.on("text-dn", function(text, next) {
		var user = store.getUser();

		if (text.to !== store.getNav().room) {
			if (user && text.mentions && (text.mentions.indexOf(user.id) > -1)) {
				updateNotifier(text.to, "mentioned");
			} else {
				updateNotifier(text.to);
			}
		}

		next();
	}, 1000);

	core.on("statechange", function(changes, next) {
		if (changes.nav && changes.nav.room) {
			updateNotifier(store.getNav().room, "remove");
		}

		next();
	}, 500);
};
