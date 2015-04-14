/* jshint browser: true */
/* global $ */

module.exports = function(core) {
	return function(type) {
		core.emit(type + "-dialog", {
				element: null, // If this is present, everything will be ignored
				title: null, // Modal title
				description: null, // A description to be displayed under title
				buttons: {}, // List of objects, e.g. - google: { text: "Google+", action: function() {} }
				content: [], // Additional content to be displayed under buttons
				action: null, // Action button, e.g. - { text: "Create account", action: function() {} }
				dismiss: true // Dialog is dismissable or not
			}, function(err, dialog) {

			var $modal = $("<div>").addClass("dialog dialog-" + type).attr("data-dialog", type),
				$dialog, $buttons, $content, $action;

			if (!dialog) {
				return;
			}

			if (dialog.element) {
				$modal.append(dialog.element);
			} else {
				$dialog = $("<form>").addClass("modal-content");

				if (dialog.title) {
					$("<h1>").addClass("dialog-title").text(dialog.title).appendTo($dialog);
				}

				if (dialog.description) {
					$("<p>").addClass("dialog-description").html(dialog.description).appendTo($dialog);
				}

				if (Object.keys(dialog.buttons).length) {
					$buttons = $("<p>").addClass("dialog-buttons");

					for (var i in dialog.buttons) {
						if (typeof dialog.buttons[i].text === "string" && typeof dialog.buttons[i].action === "function") {
							$("<button>").text(dialog.buttons[i].text)
							.on("click", dialog.buttons[i].action)
							.addClass(i)
							.appendTo($buttons);
						}
					}

					$buttons.appendTo($dialog);
				}

				if (dialog.content && dialog.content.length) {
					$content = $("<div>").addClass("dialog-content");

					for (var j = 0, k = dialog.content.length; j < k; j++) {
						$content.append(dialog.content[j]);
					}

					$content.appendTo($dialog);
				}

				if (dialog.action && typeof dialog.action.text === "string" && typeof dialog.action.action === "function") {
					$action = $("<input>").attr({
						type: "submit",
						value: dialog.action.text
					}).addClass("button dialog-action dialog-action-" + dialog.action.text.replace(/ /g, "-").toLowerCase())
					.appendTo($dialog);
				}

				$dialog.on("submit", function(e) {
					e.preventDefault();

					dialog.action.action.apply($action, [ e ]);
				});

				if (typeof dialog.dismiss !== "boolean" || dialog.dismiss === true) {
					$modal.append("<span class='modal-close'>");
				}

				$modal.append($dialog);
			}

			$modal.modal({
				dismiss: (typeof dialog.dismiss === "boolean") ? dialog.dismiss : true
			}).find("input[type=text]:not(disabled)").eq(0).focus();
		});
	};
};
