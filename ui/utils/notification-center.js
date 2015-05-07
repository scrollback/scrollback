/* jshint browser: true */

"use strict";

function NotificationCenter() {
	this._items = {};

	Object.defineProperty(this, "overview", {
		get: function() {
			var opts, text, items, content = [];

			for (var room in this._items) {
				items = [];

				opts = this._items[room];

				if (typeof opts.texts === "number") {
					items.push((opts.texts < 0 ? "" : "<span class='number texts'>" + opts.texts + "</span> ") + "new messages");
				}

				if (typeof opts.threads === "number") {
					items.push((opts.threads < 0 ? "" : "<span class='number threads'>" + opts.threads + "</span> ") + "new discussions");
				}

				if (typeof opts.mentions === "number") {
					items.push((opts.mentions < 0 ? "" : "<span class='number mentions'>" + opts.mentions + "</span> ") + "new mentions");
				}

				text = "";

				for (var i = 0, l = items.length; i < l; i++) {
					if (i > 0) {
						if (i === l - 1) {
							text += " and ";
						} else {
							text += ", ";
						}
					}

					text += items[i];
				}

				text += " in <span class='room'>" + room + "</span>";

				content.push("<div class='notification-center-item' data-room='" + room + "''><span class='content'>" + text.charAt(0).toUpperCase() + text.slice(1) + "</span><span class='close'></span></div>");
			}

			return ("<div class='notification-center'>" + content.join("") + "</div>");
		}
	});
}

NotificationCenter.prototype.add = function(room, opts) {
	if (this._items[room]) {
		for (var o in opts) {
			this._items[room][o] = opts[o];
		}
	} else {
		this._items[room] = opts;
	}

	return this;
};

module.exports =  NotificationCenter;
