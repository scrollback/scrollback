/* jshint browser: true */
/* global $, libsb */

var dialogTemplates = require("./dialogs-templates.js");

function showDialog(type) {
	var template, eventname;

	if (!type) {
		$.modal("dismiss");
		return;
	}

	// Default dialog template
	template = {
		title: "", // Modal title
		description: "", // A description to be displayed under title
		buttons: {}, // List of objects, e.g. - google: { text: "Google+", action: function() {} }
		content: [], // Additional content to be displayed under buttons
		action: null // Action button, e.g. - { text: "Create account", action: function() {} }
	};

	template = $.extend(template, dialogTemplates[type]);
	eventname = type;

	switch (type) {
		case "createroom":
			if (!libsb.user) {
				return;
			}

			if ((/^guest-/).test(libsb.user.id)) {
				template = $.extend(template, dialogTemplates["auth-createroom"]);
				eventname = "auth";
			} else if ((/^guest-/).test(libsb.user.from)) {
				template = $.extend(template, dialogTemplates["signup-createroom"]);
				eventname = "auth";
			}

			break;
	}

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
			.on("click", dialog.action.action)
			.appendTo($modal);
		}

		$modal.on("submit", function(e) {
			e.preventDefault();

			dialog.action.action.apply($action, [ e ]);
		});

		$modal.modal();
	});
}

// Emit a dialog event when navigate is called
libsb.on("navigate", function(state, next) {
	if ("dialog" in state.changes && state.source !== "modal-dismiss") {
		showDialog(state.dialog);
	}

	next();
}, 500);

// When modal is dismissed, reset the dialog property to null
$(document).on("modalDismissed", function() {
	libsb.emit("navigate", {
		dialog: null,
		source: "modal-dismiss"
	});
});

libsb.on("createroom-dialog", function(dialog, next) {
	next();
}, 100);

libsb.on("signup-dialog", function(dialog, next) {
	next();
}, 100);
