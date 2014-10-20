/* jshint browser:true */
/* global $, libsb */

var userActions = require("./notification-strings-en.js"),
	showPopOver = true,
	gotIt = [ "Got it", "Cool", "Awesome", "Great", "Impressive" ], g = 0,
	pending = [];

$(applicationCache).on("downloading", function() {
	// This is a very specialized case
	// If appcache is downloading, there is a fair chance an alert bar will show
	// It would be really weird if the calls to action is shown at the same time
	showPopOver = false;
});

$(document).on("alertbarInited modalInited popoverInited", function() {
	// Something is on the screen
	// Probably not the best time to show a popover
	showPopOver = false;
});

$(document).on("alertbarDismissed modalDismissed popoverDismissed", function() {
	// Good time to show a popover
	showPopOver = true;

	// Show pending notifications
	if (pending[0]) {
		showNotification(pending[0].origin, pending[0].name);
	}
});

function fireNotification(origin, name) {
	var notification, shownActions,
		$origin = $(origin);

	if (!showPopOver) {
		// Add the notification to the pending list
		// So we can show it later
		pending.push({
			origin: origin,
			name: name
		});

		return;
	}

	if (!(libsb.user && $origin.length && $origin.is(":visible") && name)) {
		return;
	}

	if (!libsb.user.params) {
		libsb.user.params = {};
	}

	shownActions = libsb.user.params.shownActions || [];

	if (shownActions.indexOf(name) > -1) {
		return;
	}

	notification = $("<div>").addClass("popover-calls-to-action").append(
		$("<div>").addClass("popover-content").text(userActions[name]),
		$("<div>").addClass("popover-got-it").text(gotIt[g] + "!").on("click", function() {
			$.popover("dismiss");
		})
	).popover({ origin: $(origin) });

	// Increment index for gotIt
	g++;

	if (g >= gotIt.length) {
		g = 0;
	}

	// Remove from the pending list
	for (var i = 0, l = pending.length; i < l; i++) {
		if (pending[i] && pending[i].name === name) {
			pending.splice(i, 1);
		}
	}

	shownActions.push(name);

	// Save the states to user params so that it's persistent across sessions
	libsb.user.params.shownActions = shownActions;

	libsb.emit("user-up", {
		user: libsb.user
	});
}

function showNotification(origin, name) {
	// It takes some time for the DOM to render
	// We don't know when it'll complete, so just adding a timeout
	// Also, probably the notification shouldn't be displayed instantly
	setTimeout(function() {
		fireNotification(origin, name);
	}, 300);
}

module.exports = showNotification;
