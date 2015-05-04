/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var appUtils = require("../../lib/app-utils.js"),
		validateEntity = require("../utils/validate-entity.js")(core, config, store),
		createEntity = require("../utils/create-entity.js")(core, config, store),
		showDialog = require("../utils/show-dialog.js")(core, config, store),
		currentDialog, currentDialogState, userChangeCallback;

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
				if (type === "room") {
					core.emit("setstate", {
						nav: {
							room: name,
							mode: "room",
							dialog: null,
							dialogState: null
						}
					});
				}

				if (typeof callback === "function") {
					callback();
				}
			}
		});
	}

	core.on("statechange", function(changes, next) {
		var nav = store.get("nav"),
			dialogStateChanged = false;

		if (changes.nav && changes.nav.dialogState) {
			if (currentDialogState) {
				for (var prop in changes.nav.dialogState) {
					if ((changes.nav.dialogState[prop] || currentDialogState[prop]) && (changes.nav.dialogState[prop] !== currentDialogState[prop])) {
						dialogStateChanged = true;
						break;
					}
				}
			} else {
				dialogStateChanged = true;
			}
		}

		if ((nav.dialog !== currentDialog) ||
			(changes.nav && "dialog" in changes.nav && changes.nav.dialog !== nav.dialog) ||
			 dialogStateChanged) {
			if (nav.dialog) {
				showDialog(nav.dialog);
			} else if (currentDialog) {
				$.modal("dismiss");
			}
		}

		if (typeof userChangeCallback === "function" && changes.user && appUtils.isGuest(store.get("user"))) {
				userChangeCallback();
				userChangeCallback = null;
		}

		next();
	}, 1);

	core.on("createroom-dialog", function(dialog, next) {
		var user = store.get("user"),
			context = store.get("context"),
			signingup = store.get("nav", "dialogState", "signingup"),
			nonexistent = store.get("nav", "dialogState", "nonexistent"),
			roomName = store.get("nav", "dialogState", "prefill") || "",
			nick;

		if (!user) {
			return;
		}
		if(context.env === "embed") {
			dialog.dismiss = false;
			nick = (context.embed && context.embed.nick)? context.embed.nick : "";
		}
		
		if (appUtils.isGuest(user)) {
			if (signingup) {
				dialog.title = "Create a new room";
				dialog.content = [
					"<p><b>Step 1:</b> Choose a username<input type='text' id='createroom-dialog-user' value='" + nick + "'autofocus></p>",
					"<p><b>Step 2:</b> Choose a room name<input type='text' id='createroom-dialog-room' value='" + roomName + "' autofocus></p>"
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
							username = (typeof username === "string") ? username.toLowerCase().trim() : "";

							if (!username) {
								callback("User name cannot be empty");
							} else if (username === roomname) {
								callback("User and room names cannot be the same");
							} else {
								$roomEntry.validInput(function(roomname, callback) {
									validateEntity("Room", roomname, function(res, message) {
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
						});
					}
				};
			} else {
				dialog.title = "Create a new room";
				dialog.description = "<b>Step 1:</b> Sign in to scrollback";
				dialog.content = [
					"<b>Step 2:</b> Choose a room name",
					"<input type='text' id='createroom-dialog-room' value='" + roomName + "' disabled>"
				];

				core.emit("auth", dialog, function() {
					next();
				});

				return;
			}
		} else {
			if (nonexistent) {
				dialog.title = "There is no room called '" + roomName + "' :-(";
				dialog.description = "Would you like to create the room?";
			} else {
				dialog.title = "Create a new room";
				dialog.description = "Choose a room name";
			}

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
		var signingup = store.get("nav", "dialogState", "signingup"),
			context = store.get("context"), nick;
		if (signingup) {
			if(context.env === "embed") {
				dialog.dismiss = false;
				nick = (context.embed && context.embed.nick)? context.embed.nick : "";
				
			}
			dialog.title = "Finish sign up";
			dialog.description = "Choose a username";
			dialog.content = [
				"<input type='text' id='signup-dialog-user' value='" + nick + "'autofocus>",
				"<p>Be creative. People in Scrollback will know you by this name.</p>"
			];
			dialog.action = {
				text: "Create account",
				action: function() {
					createAndValidate("user", "#signup-dialog-user", this);
				}
			};
		} else {
			dialog.title = "Sign in to scrollback";

			core.emit("auth", dialog, function() {
				next();
			});

			return;
		}

		next();
	}, 100);

	core.on("signin-dialog", function(dialog, next) {
		var user = store.get("user");

		// Ask users to upgrade their session to unrestricted
		dialog.title = "Sign in to continue";
		dialog.dismiss = false;

		userChangeCallback = function() {
			var user = store.get("user");

			if (store.get("nav", "dialog") === "signin" && user && !user.isRestricted) {
				core.emit("setstate", {
					nav: { dialog: null }
				});
			}
		};

		if (user && appUtils.isGuest(user)) {
			core.emit("auth", dialog, function() {
				next();
			});
		}
	}, 100);

	core.on("disallowed-dialog", function(dialog, next) {
		dialog.title = "Domain mismatch";
		dialog.dismiss = false;

		next();
	}, 1000);

	// Keep track of if modal is shown
	$(document).on("modalInited", function() {
		currentDialog = store.get("nav", "dialog");
		currentDialogState = store.get("nav", "dialogState");
	});

	// When modal is dismissed, reset the dialog property
	$(document).on("modalDismissed", function() {
		core.emit("setstate", {
			nav: {
				dialog: null,
				dialogState: null
			}
		});

		currentDialog = null;
	});
};
