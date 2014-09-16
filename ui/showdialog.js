/* jslint browser: true, indent: 4, regexp: true */
/* global $, lace */

/**
 * @example
 *
 * showDialog({
 *     title: "This is a title",
 *     buttons: {
 *         "Facebook" : function() {},
 *         "Persona" : function() {}
 *     },
 *     inputs: [ "username", "roomname" ],
 *     actions: {
 *         "Create account" : function() {}
 *     }
 * });
 */

var showDialog = function(opts) {
	var $dialog = $(),
		$inputs, item,
		$buttons, button, sortable = [];

	if (opts.title && typeof opts.title === "string") {
		$dialog.append($("<h1>").addClass("dialog-title").text(opts.title));
	}

	if (typeof opts.buttons === "object" && !$.isEmptyObject(opts.buttons)) {
		$buttons = $("<div>").addClass("dialog-buttons");

		for (var b in opts.buttons){
			button = opts.buttons[b];
			sortable.push([button.prio, button, b]);
		}

		sortable.sort(function(a, b){
			return a[0] - b[0];
		});

		// append buttons in sorted order
		sortable.forEach(function(button){
			if (typeof button[1].text === "string" && typeof button[1].action === "function"){
				$("<a>").addClass("button " + button[2].toLowerCase().replace(' ', '-'))
				.text(button[1].text)
				.on("click", function() {
					button[1].action();
				})
				.appendTo($buttons);
			}
		});

		$buttons.appendTo($dialog);
	}


	if (opts.inputs && opts.inputs instanceof Array) {
		$inputs = $("<div>").addClass("dialog-inputs");

		for (var i = 0, l = opts.inputs.length; i < l; i++){
			item = opts.items[i];
			sortable.push([item.prio, item, i]);
		}

		sortable.sort(function(a, b){
			return a[0] - b[0];
		});

		// append items in sorted order
		sortable.forEach(function(item){
			if (typeof item[1].text === "string" && typeof item[1].action === "function") {
				$("<li>").append($("<a>").addClass(item[2].toLowerCase().replace(' ', '-'))
								 .text(item[1].text))
				.on("click", function() {
					lace.popover.hide();
					item[1].action();
				})
				.appendTo($list.find("ul"));

			}
		});

		$inputs.appendTo($dialog);
	}

	return lace.popover.show({ origin: opts.origin, body: $popover });
};

module.exports = showopts;
