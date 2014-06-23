/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

/**
 * @example
 *
 * showMenu({
 *     origin: $("a"),
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

var lace = require("../lib/lace.js");

var showMenu = function(menu) {
    var $popover = $("<div>"),
        $list,
        $buttons;

    if (typeof menu.title === "string") {
        $("<div>").addClass("popover-section popover-title")
                  .text(menu.title)
                  .appendTo($popover);
    }

    if (typeof menu.buttons === "object") {
        $buttons = $("<div>").addClass("popover-section popover-buttons");

        for (var button in menu.buttons) {
            if (typeof button === "string" && typeof menu.buttons[button] === "function") {
                $("<a>").addClass("button " + button.toLowerCase().replace(/\s+/g, "-")).text(button)
                        .on("click", menu.buttons[button])
                        .appendTo($buttons);
            }
        }

        $buttons.appendTo($popover);
    }

    if (typeof menu.items === "object") {
        $list = $("<div>").addClass("popover-section").append("<ul>");

        for (var item in menu.items) {
            if (typeof item === "string" && typeof menu.items[item] === "function") {
                $("<li>").append($("<a>")
                         .text(item)
                         .on("click", menu.items[item]))
                         .appendTo($list.find("ul"));
            }
        }

        $list.appendTo($popover);
    }

    return lace.popover.show({ origin: menu.origin, body: $popover });
};

module.exports = showMenu;
