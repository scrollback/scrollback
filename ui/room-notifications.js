/* jshint browser: true */
/* global $, libsb */

function updateNotifier(roomName, type){
	var $roomItem = $("[data-room='" + roomName + "']"),
		$badge = $roomItem.find(".js-room-notifications-counter"),
		counter;

	if (!($roomItem.length && $badge.length)) {
		return;
	}

	if (type === "remove"){
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

libsb.on("text-dn", function(text, next) {
	if (text.to !== window.currentState.roomName) {
		if (libsb.user && text.mentions && (text.mentions.indexOf(libsb.user.id) > -1)) {
			updateNotifier(text.to, "mentioned");
		} else {
			updateNotifier(text.to);
		}
	}

	next();
}, 1000);

libsb.on("navigate", function(state, next) {
	if (state.roomName !== state.old.roomName){
		updateNotifier(state.roomName, "remove");
	}

	next();
}, 500);
