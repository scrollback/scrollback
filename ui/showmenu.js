/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

var lace = require("../lib/lace.js");

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

var showMenu = function(menu) {
    var $popover = $("<div>"),
        $list, item,
        $buttons, button, sortable = [];

    if (typeof menu.title === "string") {
        $("<div>").addClass("popover-title")
                  .text(menu.title)
                  .appendTo($popover);
    }

    if (typeof menu.buttons === "object") {
        $buttons = $("<div>").addClass("popover-buttons");
        
        for(button in menu.buttons){
            sortable.push([button.prio, button]);
        }
        
        sortable.sort(function(a, b){
            return b[0] - a[0];
        });
        
        // append buttons in sorted order
        sortable.forEach(function(button){
            if (typeof button[1].text === "string" && typeof button[1].action === "function"){
                $("<a>").addClass("button " + button[1].text.toLowerCase()).text(button[1].text).on("click", button[1].action).appendTo($buttons);
            }
        });

        $buttons.appendTo($popover);
    }

    if (typeof menu.items === "object") {
        $list = $("<ul>");
		sortable = [];
		
		for(item in menu.items){
			sortable.push([item.prio, item]);
		}
		
		sortable.sort(function(a, b){
			return b[0] - a[0];
		});
		
		// append items in sorted order
        sortable.forEach(function(){
            if (typeof item === "string" && typeof menu.items[item] === "function") {
                $("<li>").append($("<a>")
                         .text(item[1].text)
                         .on("click", item[1].action))
                         .appendTo($list);
            }
        });

        $list.appendTo($popover);
    }

    return lace.popover.show({ origin: $(menu.origin), body: $popover });
};

module.exports = showMenu;
