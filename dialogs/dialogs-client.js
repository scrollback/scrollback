/* jshint browser: true */
/* global $, libsb */

// Emit a dialog event
function showDialog(type, template) {
	libsb.emit(type + "-dialog", template, function(err, dialog) {
		var $modal = $("<form>").addClass(type + "-dialog dialog"),
			$buttons, $content, $action;

		if (dialog.title) {
			$("<h1>").addClass("dialog-title").text(dialog.title).appendTo($modal);
		}

		if (dialog.description) {
			$("<p>").addClass("dialog-description").html(dialog.description).appendTo($modal);
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

// Emit a dialog event when navigate is called
libsb.on("navigate", function(state, next) {
	if (state.source === "dialog" || ("dialog" in state.changes && state.source !== "modal-dismiss")) {
		if (!state.dialog) {
			$.modal("dismiss");

			return next();
		}

		showDialog(state.dialog, {
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

// When modal is dismissed, reset the dialog property to null
$(document).on("modalDismissed", function() {
	libsb.emit("navigate", {
		dialog: null,
		source: "modal-dismiss"
	});
});
