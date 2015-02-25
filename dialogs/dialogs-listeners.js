/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var appUtils = require("../lib/appUtils.js"),
		validateEntity = require("./validate-entity.js")(core, config, store),
		createEntity = require("./create-entity.js")(core, config, store),
		showDialog = require("./show-dialog.js")(core, config, store),
		userChangeCallback;

	function createAndValidate(type, entry, button, callback) {
		var $entry = $(entry),
			$button = $(button),
			name = $entry.val();

		createEntity(type, name, function(res, message) {
			if (res === "wait") {
				$button.addClass("working");
			} else {
				$button.removeClass("working");
			}

			if (res === "error") {
				$entry.validInput(function(value, callback) {
					callback(message);
				});
			}

			if (res === "ok") {
				core.emit("setstate", {
					nav: { dialog: null }
				});

				if (typeof callback === "function") {
					callback();
				}
			}
		});
	}

	core.on("storechange", function(changes, next) {
		var dialog;

		if (typeof userChangeCallback === "function" && changes.user && appUtils.isGuest(store.get("user"))) {
				userChangeCallback();
				userChangeCallback = null;
		}

		if (changes.nav && "dialog" in changes.nav || (/(createroom|signup|signin)/.test(dialog) && changes.user)) {
			dialog = store.getNav().dialog;

			if (!dialog) {
				$.modal("dismiss");

				return next();
			}

			showDialog(dialog, {
				title: null, // Modal title
				description: null, // A description to be displayed under title
				buttons: {}, // List of objects, e.g. - google: { text: "Google+", action: function() {} }
				content: [], // Additional content to be displayed under buttons
				action: null, // Action button, e.g. - { text: "Create account", action: function() {} }
				dismiss: true // Dialog is dismissable or not
			});
		}

		next();
	}, 100);

	core.on("createroom-dialog", function(dialog, next) {
		var roomName = store.getNav().room;

		if (appUtils.isGuest(store.get("user"))) {
			if (store.getUser().identities.length) {
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
							self = this;

						$userEntry.validInput(function(username, callback) {
							var roomname = $roomEntry.val();

							roomname = (typeof roomname === "string") ? roomname.toLowerCase().trim() : "";

							if (!username) {
								callback("User name cannot be empty");
							} else if (username === roomname) {
								callback("User and room names cannot be the same");
							}
						});

						$roomEntry.validInput(function(roomname, callback) {
							validateEntity(roomname, function(res, message) {
								if (res === "error") {
									callback(message);
								}

								if (res === "ok") {
									callback();

									createAndValidate("user", $userEntry, self, function() {
										createAndValidate("room", $roomEntry, self);
									});
								}
							});
						});
					}
				};
			} else {
				dialog.title = "Create a new room";
				dialog.description = "<b>Step 1:</b> Sign in to scrollback";
				dialog.content = [
					"<p><b>Step 2:</b> Choose a room name</p>",
					"<input type='text' id='createroom-dialog-room' value='" + roomName + "' disabled>"
				];

				core.emit("auth", dialog, function() {
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
					createAndValidate("room", "#createroom-dialog-room", this);
				}
			};
		}

		next();
	}, 100);

	core.on("signup-dialog", function(dialog, next) {
		if (appUtils.isGuest(store.get("user"))) {
			if (store.getUser().identities.length) {
				dialog.title = "Finish sign up";
				dialog.description = "Choose a username";
				dialog.content = [
					"<input type='text' id='signup-dialog-user' autofocus>",
					"<p>Be creative. People in Scrollback will know you by this name.</p>"
				];
				dialog.action = {
					text: "Create account",
					action: function() {
						createAndValidate("user", "#signup-dialog-user", this);
					}
				};
			} else {
				dialog.title = "Sign up for scrollback";

				core.emit("auth", dialog, function() {
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

	core.on("signin-dialog", function(dialog, next) {
		// Ask users to upgrade their session to unrestricted
		dialog.title = "Login to continue.";
		dialog.dismiss = false;

		userChangeCallback = function() {
			if (store.getNav().dialog === "signin" && store.getUser().isRestricted) {
				core.emit("setstate", {
					nav: { dialog: null }
				});
			}
		};

		core.emit("auth", dialog, function() {
			next();
		});
	}, 100);

	core.on("noroom-dialog", function(dialog, next) {
		dialog.title = "This room doesn't exist";
		dialog.dismiss = false;

		next();
	}, 1000);

	core.on("disallowed-dialog", function(dialog, next) {
		dialog.title = "Domain Mismatch";
		dialog.dismiss = false;

		next();
	}, 1000);

	core.on("logout-dialog", function(dialog, next) {
		dialog.title = "You've been signed out!";
		dialog.action = {
			text: "Go back as guest",
			action: function() {
				core.emit("setstate", {
					nav: { dialog: null }
				}, function() {
					window.location.reload();
				});
			}
		};
		dialog.dismiss = false;

		next();
	}, 500);

	// When modal is dismissed, reset the dialog property
	$(document).on("modalDismissed", function() {
		core.emit("setstate", {
			nav: { dialog: null }
		});
	});
};
