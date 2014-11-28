/* jshint browser: true */
/* global $, libsb */

var getDialogTemplates = require("./dialogs-templates.js"),
	signingUp;

function showDialog(eventname, type, template) {
	libsb.emit(eventname + "-dialog", template, function(err, dialog) {
		var $modal = $("<form>").addClass(type + "-dialog " + eventname + "-dialog dialog"),
			$buttons, $content, $action;

		if (dialog.title) {
			$("<h1>").addClass("dialog-title").text(dialog.title).appendTo($modal);
		}

		if (dialog.description) {
			$("<p>").addClass("dialog-description").text(dialog.description).appendTo($modal);
		}

		if (Object.keys(dialog.buttons).length) {
			$buttons = $("<div>").addClass("dialog-buttons");

			for (var i in dialog.buttons) {
				if (typeof dialog.buttons[i].text === "string" && typeof dialog.buttons[i].action === "function") {
					$("<a>").text(dialog.buttons[i].text)
					.on("click", dialog.buttons[i].action)
					.addClass("button " + i)
					.appendTo($buttons);
				}
			}

			$buttons.appendTo($modal);
		}

		if (dialog.content && dialog.content.length) {
			$content = $("<div>").addClass("dialog-content");

			for (var j = 0, k = dialog.content.length; j < k; j++) {
				$content.append(dialog.content[j]);
			}

			$content.appendTo($modal);
		}

		if (dialog.action && typeof dialog.action.text === "string" && typeof dialog.action.action === "function") {
			$action = $("<input>").attr({
				type: "submit",
				value: dialog.action.text
			}).addClass("button dialog-action dialog-action-" + dialog.action.text.replace(/ /g, "-").toLowerCase())
			.appendTo($modal);
		}

		$modal.on("submit", function(e) {
			e.preventDefault();

			dialog.action.action.apply($action, [ e ]);
		});

		$modal.modal({
			dismiss: (typeof dialog.dismiss === "boolean") ? dialog.dismiss : true
		}).find("input[type=text]:not(disabled)").eq(0).focus();
	});
}

function emitDialog(type) {
	var defaults, template, eventname,
		dialogTemplates;

	if (!type) {
		return $.modal("dismiss");
	}

	// Default dialog template
	defaults = {
		title: "", // Modal title
		description: "", // A description to be displayed under title
		buttons: {}, // List of objects, e.g. - google: { text: "Google+", action: function() {} }
		content: [], // Additional content to be displayed under buttons
		action: null, // Action button, e.g. - { text: "Create account", action: function() {} }
		dismiss: true // Dialog is dismissable or not
	};

	dialogTemplates = getDialogTemplates({
		roomName: (window.currentState.mode === "noroom") ? window.currentState.roomName : ""
	});

	template = (type in dialogTemplates) ? $.extend({}, defaults, dialogTemplates[type]) : $.extend({}, defaults);

	eventname = type;

	switch (type) {
		case "createroom":
			if (!libsb.user) {
				return;
			}

			if (signingUp) {
				template = $.extend({}, defaults, dialogTemplates["signup-createroom"]);
				signingUp = false;
			} else if ((/^guest-/).test(libsb.user.id)) {
				template = $.extend({}, defaults, dialogTemplates["auth-createroom"]);
				eventname = "auth";
			}

			break;
	}

	showDialog(eventname, type, template);
}

// When modal is dismissed, reset the dialog property to null
$(document).on("modalDismissed", function() {
	libsb.emit("navigate", {
		dialog: null,
		source: "modal-dismiss"
	});
});

// Emit a dialog event when navigate is called
libsb.on("navigate", function(state, next) {
	if (state.source === "dialog" || ("dialog" in state.changes && state.source !== "modal-dismiss")) {
		emitDialog(state.dialog);
	}

	next();
}, 500);

libsb.on("init-dn", function(init, next) {
	if (init.auth && init.user.identities && !init.user.id && init.resource == libsb.resource) {
		signingUp = true;
	} else {
		signingUp = false;
	}

	if (window.currentState.dialog === "createroom") {
		libsb.emit("navigate", {
			dialog: "createroom",
			source: "dialog"
		});
	} else if (signingUp) {
		libsb.emit("navigate", { dialog: "signup" });
		signingUp = false;
	}

	next();
}, 500);

libsb.on("createroom-dialog", function(dialog, next) {
	next();
}, 100);

libsb.on("signup-dialog", function(dialog, next) {
	next();
}, 100);
