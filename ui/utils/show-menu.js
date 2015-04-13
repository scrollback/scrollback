/* jshint browser: true */
/* global $ */

/**
 * @example
 *
 * showMenu("user-menu", {
 *	 origin: $("a"),
 *	 title: "This is a title",
 *	 buttons: {
 *		 "facebook" : {
 *				text: {string},
 *				prio: {number},
 *				action: {function}
 *			}
 *	 },
 *	 items: {
 *		 "guest-settings" :{
 *				text: {string},
 *				prio: {number},
 *				action: {function}
 *			}
 *	 }
 * });
 */

module.exports = function(type, menu) {
	var $popover = $("<div>"),
		$list, item,
		$buttons, button, sortable = [];

	if ($.isEmptyObject(menu.buttons) && $.isEmptyObject(menu.items)) {
		return;
	}

	if (typeof menu.title === "string") {
		$("<div>").addClass("popover-section popover-title")
			.text(menu.title)
			.appendTo($popover);
	}

	if (typeof menu.buttons === "object" && !$.isEmptyObject(menu.buttons)) {
		$buttons = $("<div>").addClass("popover-section popover-buttons");

		for (var b in menu.buttons) {
			button = menu.buttons[b];
			sortable.push([button.prio, button, b]);
		}

		sortable.sort(function(a, b) {
			return a[0] - b[0];
		});

		// append buttons in sorted order
		sortable.forEach(function(button) {
			if (typeof button[1].text === "string" && typeof button[1].action === "function") {
				$("<button>").addClass(button[2].toLowerCase().replace(' ', '-'))
					.text(button[1].text)
					.on("click", function() {
						$popover.popover("dismiss");

						button[1].action();
					})
					.appendTo($buttons);
			}
		});

		$buttons.appendTo($popover);
	}

	if (typeof menu.items === "object" && !$.isEmptyObject(menu.items)) {
		$list = $("<div>").addClass("popover-section").append("<ul>");
		sortable = [];

		for (var i in menu.items) {
			item = menu.items[i];
			sortable.push([item.prio, item, i]);
		}

		sortable.sort(function(a, b) {
			return a[0] - b[0];
		});

		// append items in sorted order
		sortable.forEach(function(item) {
			if (typeof item[1].text === "string" && typeof item[1].action === "function") {
				$("<li>").append($("<a>").addClass("menu-item menu-" + item[2].toLowerCase().replace(' ', '-'))
						.text(item[1].text))
					.on("click", function() {
						$popover.popover("dismiss");

						item[1].action();
					})
					.appendTo($list.find("ul"));

			}
		});

		$list.appendTo($popover);
	}

	return $popover.addClass("menu menu-" + type).popover({
		arrow: !!(menu.arrow),
		origin: menu.origin
	});
};
