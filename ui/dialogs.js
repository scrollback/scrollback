/* jshint browser: true */
/* global $, libsb */

// Emit a dialog event when navigate is called
libsb.on("navigate", function(state, next) {
    if (state.changes.dialog && state.source !== "modal-dismiss") {
        if (state.dialog) {
            libsb.emit(state.dialog + "-dialog", {
                title: "", // Modal title
                description: "", // A description to be displayed under title
                buttons: {}, // List of objects, e.g. - google: { text: "Google+", action: function() {} }
                content: [], // Additional content to be displayed under buttons
                action: null // Action button, e.g. - { text: "Create account", action: function() {} }
            }, function(err, dialog) {
                var $modal = $("<div>").addClass(state.dialog + "-dialog dialog"),
                    $buttons, $content;

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
                    $("<a>").addClass("dialog-action dialog-action-" + dialog.action.text.replace(/ /g, "-").toLowerCase())
                            .on("click", dialog.action.action)
                            .appendTo($modal);
                }

                $modal.modal();
            });
        } else {
            $.modal("dismiss");
        }
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
