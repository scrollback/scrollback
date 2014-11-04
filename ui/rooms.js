/* jshint browser: true */
/* global $ */

function Rooms(container, render, prefix) {
	if (typeof render !== "function") {
		throw new Error("Invalid render function passed!");
	}

	this.prefix = prefix;
	this.container = $(container);

	if (!this.container.length) {
		throw new Error("Container does not exist!");
	}

	this.render = function(roomObj) {
		var $el = render(roomObj);

		$el.attr("id", this.prefix + "-" + roomObj.id);
		$el.attr("data-room", roomObj.id);

		return $el;
	};

	this.getElement = function(roomObj) {
		return this.container.find("#" + this.prefix + "-" + roomObj.id);
	};
}

Rooms.prototype = {
	container: this.container,

	add: function(roomObj, callback) {
		var $el;

		if (!(roomObj && roomObj.id)) {
			return;
		}

		if (this.getElement(roomObj).length) {
			return;
		}

		$el = this.container.append(this.render(roomObj));

		if (typeof callback === "function") {
			return callback.apply($el, [ roomObj ]);
		}
	},

	remove: function(roomObj, callback) {
		var $el;

		if (!(roomObj && roomObj.id)) {
			return;
		}

		$el = this.getElement(roomObj);

		if (!$el.length) {
			return;
		}

		$el.remove();

		if (typeof callback === "function") {
			return callback.apply($el, [ roomObj ]);
		}
	}
};

module.exports = function(container, render, prefix) {
	return new Rooms(container, render, prefix);
};
