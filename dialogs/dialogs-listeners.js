/* jshint browser: true */
/* global $, libsb */

var validate = require("../lib/validate.js"),
	afterSignUp,
	signingUp,
	isRestricted = false;

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

function validateName(entry, button, type, callback) {
	var $entry = $(entry),
		$button = $(button),
		name = $entry.val(),
		validation;

	name = (typeof name === "string") ? name.toLowerCase().trim() : "";

	validation = validate(name);

	if (!validation.isValid) {
		return showError(type + " " + validation.error, entry);
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
	validateName(entry, button, "Room", function(name) {
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
				callback();
			}

			libsb.emit("navigate", {
				dialog: null
			});
		});
	});
}

function createUser(entry, button, callback) {
	validateName(entry, button, "User", function(name) {
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

			libsb.emit("navigate", {
				dialog: null
			});
		});
	});
}

libsb.on("init-dn", function(init, next) {
	if (init.auth && init.user.identities && !init.user.id && init.resource == libsb.resource) {
		signingUp = true;
	} else {
		signingUp = false;
	}
	if (/(createroom|signup)/.test(window.currentState.dialog)) {
		libsb.emit("navigate", {
			dialog: window.currentState.dialog,
			source: "dialog"
		});
	} else if (signingUp) {
		libsb.emit("navigate", {
			dialog: "signup"
		});
	} else if (isRestricted) {
		libsb.emit("navigate", {
			dialog: null
		});
	}

	next();
}, 100);

libsb.on("user-dn", function(user, next) {
	if (typeof afterSignUp === "function") {
		afterSignUp();
		afterSignUp = null;
	}

	next();
}, 100);

libsb.on("createroom-dialog", function(dialog, next) {
	var roomName = (window.currentState.mode === "noroom") ? window.currentState.roomName : "";

	if ((/^guest-/).test(libsb.user.id)) {
		if (signingUp) {
			dialog.title = "Create a new room";
			dialog.content = [
				"<p><b>Step 1:</b> Choose a username</p>",
				"<input type='text' id='createroom-dialog-user' autofocus>",
				"<p><b>Step 2:</b> Choose a room name</p>",
				"<input type='text' id='createroom-dialog-room' value='" + roomName + "' autofocus>"
			];
			dialog.action = {
				text: "Sign up & create room",
				action: function() {
					var $userEntry = $("#createroom-dialog-user"),
						$roomEntry = $("#createroom-dialog-room"),
						username = $userEntry.val(),
						roomname = $roomEntry.val(),
						self = this;

					username = (typeof username === "string") ? username.toLowerCase().trim() : "";
					roomname = (typeof roomname === "string") ? roomname.toLowerCase().trim() : "";

					if (!username) {
						return showError("User name cannot be empty", $userEntry);
					}

					if (username === roomname) {
						return showError("User and room names cannot be the same", $userEntry);
					}

					validateName($roomEntry, self, "Room", function() {
						createUser($userEntry, self, function() {
							createRoom($roomEntry, self);
						});
					});
				}
			};

			signingUp = false;
		} else {
			dialog.title = "Create a new room";
			dialog.description = "<b>Step 1:</b> Sign in to scrollback";
			dialog.content = [
				"<p><b>Step 2:</b> Choose a room name</p>",
				"<input type='text' id='createroom-dialog-room' value='" + roomName + "' disabled>"
			];

			libsb.emit("auth", dialog, function() {
				next();
			});

			return;
		}
	} else {
		dialog.title = "Create a new room";
		dialog.description = "Choose a room name";
		dialog.content = ["<input type='text' id='createroom-dialog-room' value='" + roomName + "' autofocus>"];
		dialog.action = {
			text: "Create room",
			action: function() {
				createRoom("#createroom-dialog-room", this);
			}
		};
	}

	next();
}, 100);

libsb.on("signup-dialog", function(dialog, next) {
	if ((/^guest-/).test(libsb.user.id)) {
		if (signingUp) {
			dialog.title = "Finish sign up";
			dialog.description = "Choose a username";
			dialog.content = [
				"<input type='text' id='signup-dialog-user' autofocus>",
				"<p>Be creative. People in Scrollback will know you by this name.</p>"
			];
			dialog.action = {
				text: "Create account",
				action: function() {
					createUser("#signup-dialog-user", this);
				}
			};

			signingUp = false;
		} else {
			dialog.title = "Sign up for scrollback";

			libsb.emit("auth", dialog, function() {
				next();
			});

			return;
		}
	} else {
		dialog.title = "You're already signed in!";
		dialog.description = "Sign out to sign up for a new account";
	}

	next();
}, 100);


libsb.on("signin-dialog", function(dialog, next) {
	isRestricted = true;
	dialog.title = "Restricted session, login.";
	libsb.emit("auth", dialog, function() {
		next();
	});
}, 100);