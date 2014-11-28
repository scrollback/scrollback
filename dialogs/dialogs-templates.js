/* jshint browser: true */
/* global $, libsb */

var validate = require("../lib/validate.js"),
	afterSignUp;

function getDialogTemplates(opts) {
	var roomName = (opts && opts.roomName) ? opts.roomName : "",
		userName = (opts && opts.userName) ? opts.userName : "";

	return {
		"auth": {
			title: "Sign in to Scrollback"
		},
		"signup": {
			title: "Finish sign up",
			description: "Choose a username.",
			content: [
				"<input type='text' id='signup-dialog-user' value='" + userName + "' autofocus>",
				"<p>Be creative. People in Scrollback will know you by this name.</p>"
			],
			action: {
				text: "Create account",
				action: function() {
					createUser("#signup-dialog-user", this);
				}
			}
		},
		"auth-createroom": {
			title: "Create a new room",
			description: "You must sign in first.",
			content: [
				"<p>Choose a room name for your community.</p>",
				"<input type='text' id='createroom-dialog-room' value='" + roomName + "' disabled>"
			]
		},
		"signup-createroom": {
			title: "Create a new room",
			content: [
				"<p>Choose a user name.</p>",
				"<input type='text' id='createroom-dialog-user' value='" + userName + "' autofocus>",
				"<p>Choose a room name for your community.</p>",
				"<input type='text' id='createroom-dialog-room' value='" + roomName + "' autofocus>"
			],
			action: {
				text: "Sign up & create room",
				action: function() {
					var $userEntry = $("#createroom-dialog-user"),
						$roomEntry = $("#createroom-dialog-room"),
						username = $userEntry.val(),
						roomname = $roomEntry.val(),
						self = this;

					username = (typeof username === "string") ? username.toLowerCase().trim() : "";
					roomname = (typeof roomname === "string") ? roomname.toLowerCase().trim() : "";

					if (username === roomname) {
						return showError("User and room names cannot be the same", $userEntry);
					}

					if (!roomname) {
						return showError("Room name cannot be empty", $roomEntry);
					}

					createUser($userEntry, self, function() {
						createRoom($roomEntry, self);
					});
				}
			}
		},
		"createroom": {
			title: "Create a new room",
			description: "Choose a room name for your community.",
			content: [ "<input type='text' id='createroom-dialog-room' value='" + roomName + "' autofocus>" ],
			action: {
				text: "Create room",
				action: function() {
					createRoom("#createroom-dialog-room", this);
				}
			}
		}
	};
}

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

function createEntity(entry, button, callback) {
	var $entry = $(entry),
		$button = $(button),
		name = $entry.val(),
		validation;

	name = (typeof name === "string") ? name.toLowerCase().trim() : "";

	validation = validate(name);

	if (!validation.isValid) {
		return showError(validation.error, entry);
	}

	$button.addClass("working");

	checkExisting(name, function(isTaken) {
		$button.removeClass("working");

		if (isTaken) {
			showError(name + " is not available. May be try another?", entry);
		} else {
			showError(false);

			if (typeof callback === "function") {
				callback(name);
			}
		}

	});
}

function createRoom(entry, button, callback) {
	createEntity(entry, button, function(name) {
		var errormessage = "We could not create the room. Please refresh the page and try again.";

		if (!name) {
			return showError(errormessage, entry);
		}

		libsb.emit("room-up", {
			to: name,
			room: {
				id: name,
				description: "",
				params: {},
				guides: {}
			}
		}, function(err) {
			if (err) {
				return showError(errormessage, entry);
			}

			if (typeof callback === "function") {
				return callback();
			}

			libsb.emit("navigate", { dialog: null });
		});
	});
}

function createUser(entry, button, callback) {
	createEntity(entry, button, function(name) {
		var errormessage = "We could not create your account. Please refresh the page and try again.";

		if (!name || !libsb.user || !libsb.user.identities) {
			return showError(errormessage, entry);
		}

		libsb.emit("user-up", {
			user: {
				id: name,
				identities: libsb.user.identities,
				picture: libsb.user.picture,
				params: {
					pictures: libsb.user.params.pictures
				},
				guides: {}
			}
		}, function(err) {
			if (err) {
				return showError(errormessage, entry);
			}

			if (typeof callback === "function") {
				afterSignUp = callback;
			}

			libsb.emit("navigate", { dialog: null });
		});
	});
}

libsb.on("user-dn", function(user, next) {
	if (typeof afterSignUp === "function") {
		afterSignUp();
		afterSignUp = null;
	}

	next();
}, 800);

module.exports = getDialogTemplates;
