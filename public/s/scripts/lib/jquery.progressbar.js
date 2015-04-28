var registerPlugin = require("./jquery.lace.js");

registerPlugin("progressbar", {
	parent: "body"
}, {

	/**
	 * Show a progress indicator.
	 */
	init: function() {
		var settings = this.settings,
			$progressbar = $(this.element);

		// The "loading" class animates the progressbar with CSS3 animations
		// Since we're initializing with JS, don't use the same CSS3 animation
		$progressbar.removeClass("loading").addClass("progressbar").width(0).appendTo(settings.parent);

		// Randomize the progress value
		$progressbar.data("progressbarInterval", setInterval(function() {
			var width = parseInt(($progressbar.width() / $progressbar.parent().width()) * 100) || 0;

			width += (100 - Math.round(width).toFixed(2)) * Math.random() * 0.5;

			$progressbar.width(width + "%");
		}, 1000));

		// Progressbar is now initialized
		$.event.trigger("progressbarInited", [ $progressbar ]);
	},

	/**
	 * Cleanup progressbar.
	 */
	destroy: function() {
		var $element = this.element ? $(this.element) : $(".progressbar");

		// The element doesn't exist
		if (!$element.length) {
			return;
		}

		// Remove classes
		$element.removeClass("progressbar loading").css({ width: "" });
	},

	/**
	 * Set progress by percentage
	 * @param {Number} amount
	 */
	set: function(amount) {
		var $element = this.element ? $(this.element) : $(".progressbar");

		// Element doesn't exist
		if (!$element.length) {
			return;
		}

		// Parse the value as an integer
		amount = parseInt(amount);

		// The value is not a number
		if (isNaN(amount)) {
			return;
		}

		// Clear the interval which sets randomized progress
		clearInterval($element.data("progressbarInterval"));

		// Remove CSS3 animation by removing "loading" class and set the progress
		$element.removeClass("loading").width(amount + "%");

		// Progressbar value is now set
		$.event.trigger("progressbarSet", [ $element, amount ]);
	},

	/**
	 * Dismiss progress indicator.
	 */
	dismiss: function() {
		var self = this,
			$element = self.element ? $(self.element) : $(".progressbar");

		// Element doesn't exist
		if (!$element.length) {
			return;
		}

		// Set the progress to "100%"
		self.set(100);

		// Remove the element from DOM
		setTimeout(function() {
			self.destroy();
			$element.remove();

			// Progressbar is now dismissed
			$.event.trigger("progressbarDismissed", [ $element ]);
		}, 500);
	}
});
