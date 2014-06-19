/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

var lace = require("../lib/lace.js");

/**
 * @example
 *
 * showMenu({
 *     title: "This is a title",
 *     buttons: {
 *         "Facebook" : function() {},
 *         "Persona" : function() {}
 *     },
 *     items: {
 *         "Show" : function() {},
 *         "Hide" : function() {}
 *     }
 * });
 */

var showMenu = function(menu) {
    var $popover = $("<div>"),
        $list,
        $buttons;

    if (typeof menu.title === "string") {
        $("<div>").addClass("popover-title")
                  .text(menu.title)
                  .appendTo($popover);
    }

    if (typeof menu.buttons === "object") {
        $buttons = $("<div>").addClass("popover-buttons");

        for (var button in menu.buttons) {
            $("<a>").addClass("button " + button.toLowerCase()).text(button)
                    .on("click", menu.buttons[button])
                    .appendTo($buttons);
        }

        $buttons.appendTo($popover);
    }

    if (typeof menu.items === "object") {
        $list = $("<ul>");

        for (var item in menu.items) {
            $("<li>").append($("<a>")
                     .text(item)
                     .on("click", menu.items[item]))
                     .appendTo($list);
        }

        $list.appendTo($popover);
    }

    return lace.popover.show({ origin: $(".user-area"), body: $popover });
};

module.exports = showMenu;
