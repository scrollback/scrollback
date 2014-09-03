/* jshint browser: true */
/* global $, libsb */

function updateNotifier(roomName, type){
	var $roomItem = $("[data-room='" + roomName + "']"),
		$badge = $roomItem.find(".room-notifications-counter"),
		counter;

	if (type === "remove"){
		$badge.removeClass("mentioned").text("");

		return;
	}

	counter = parseInt($badge.text()) || 0;

	counter++;

	$badge.text(counter);

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
