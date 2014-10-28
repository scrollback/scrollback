/* jshint browser: true */
/* global $ */

function Rooms(container, render) {
	if (typeof render !== "function") {
		throw new Error("Invalid render function passed!");
	}

	this.container = $(container);

	if (!this.container.length) {
		throw new Error("Container does not exist!");
	}

	this.render = function(roomObj) {
		var $el = render(roomObj);

		$el.attr("id", "room-item-" + roomObj.id);

		return $el;
	};

	this.getElement = function(roomObj) {
		var roomId = roomObj.id;

		return this.container.find("#room-item-" + roomId);
	};
}

Rooms.prototype = {
	add: function(roomObj) {
		if (!(roomObj && roomObj.id)) {
			return;
		}

		if (this.getElement(roomObj).length) {
			return;
		}

		return this.container.append(this.render(roomObj));
	},

	remove: function(roomObj) {
		return this.getElement(roomObj).remove();
	},

	empty: function() {
		return this.container.empty();
	}
};

module.exports = function(container, render) {
	return new Rooms(container, render);
};
