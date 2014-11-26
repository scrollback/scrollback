/* jshint browser: true */
/* global $, libsb */

var validate = require("../lib/validate.js"),
	dialogTemplates = {
		"auth": {
			title: "Sign in to Scrollback"
		},
		"signup": {
			title: "Finish sign up",
			content: [
				"<input type='text' id='signup-dialog-user' autofocus>",
				"<p>Be creative. People in Scrollback will know you by this name.</p>"
			],
			action: {
				text: "Create account",
				action: function() {}
			}
		},
		"auth-createroom": {
			title: "Create a new room",
			description: "You must sign in first.",
			content: [
				"<p>Choose a room name for your community.</p>",
				"<input type='text' id='createroom-dialog-room' autofocus>"
			]
		},
		"signup-createroom": {
			title: "Create a new room",
			content: [
				"<p>Choose a user name.</p>",
				"<input type='text' id='createroom-dialog-user' autofocus>",
				"<p>Choose a room name for your community.</p>",
				"<input type='text' id='createroom-dialog-room' autofocus>"
			],
			action: {
				text: "Create room",
				action: function() {}
			}
		},
		"createroom": {
			title: "Create a new room",
			description: "Choose a room name for your community.",
			content: [
				"<input type='text' id='createroom-dialog-room' autofocus>"
			],
			action: {
				text: "Create room",
				action: function() {
					createRoom("#createroom-dialog-room", this);
				}
			}
		}
	};

function showError(error, entry) {
	var $entry = $(entry),
		$errorMsg = $entry.data("errorMsg") || $();

	if (!error) {
		$entry.removeClass("error");
		$errorMsg.popover("dismiss");

		return;
	}

	$entry.addClass("error");

	$errorMsg = $("<div>").addClass("error").append(
		$("<div>").addClass("popover-content").text(error)
	).popover({
		origin: $entry
	});

	$entry.data("errorMsg", $errorMsg);

	$(document).off("modalDismissed.errorentry").on("modalDismissed.errorentry", function() {
		$errorMsg.popover("dismiss");
	});

	$entry.off("change.errorentry input.errorentry paste.errorentry").on("change.errorentry input.errorentry paste.errorentry", function() {
		$errorMsg.popover("dismiss");

		$(this).removeClass("error");
	});

	$entry.focus();
}

function checkExisting(name, callback) {
	libsb.emit("getRooms", {
		ref: name
	}, function(err, res) {
		if (res && res.results && res.results.length) {
			return callback(true);
		}

		libsb.emit("getUsers", {
			ref: name
		}, function(err, res) {
			if (res && res.results && res.results.length) {
				return callback(true);
			}

			return callback(false);
		});
	});

}

function createRoom(entry, button) {
	var $entry = $(entry),
		$button = $(button),
		name = $entry.val(),
		validation = validate(name);

	if (!validation.isValid) {
		showError(validation.error, entry);

		return;
	}

	$button.addClass("working");

	checkExisting(name, function(isTaken) {
		$button.removeClass("working");

		if (isTaken) {
			showError(name + " is not available!", entry);
		} else {
			showError(false);

			libsb.emit("room-up", {
				to: name,
				room: {
					id: name,
					description: "",
					params: {},
					guides: {}
				}
			}, function() {
				libsb.emit("navigate", { dialog: null });
			});
		}

	});
}

module.exports = dialogTemplates;
