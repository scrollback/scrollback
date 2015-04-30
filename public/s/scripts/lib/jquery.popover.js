var registerPlugin = require("./jquery.lace.js");

registerPlugin("popover", {
	parent: "body"
}, {

	/**
	 * Show a popover.
	 */
	init: function() {
		var self = this,
			settings = self.settings,
			$origin = $(self.settings.origin),
			$popover = $(self.element).addClass("popover-body"),
			winheight, winwidth,
			originoffset, originheight, originwidth,
			popoverheight, popoverwidth, popovermargin,
			spacetop, spacebottom, spaceleft, spaceright,
			classnames = "",
			id = new Date().getTime();

		// If origin doesn't exist, return
		if (!$origin.length) {
			return;
		}

		// A popover is already shown for the current origin
		// Probably the user is trying to close the popover
		if ($origin.data("popover")) {
			return;
		}

		// Add info to popover so that we can properly remove events
		$popover.data("popover-id", id);
		$popover.data("popover-origin", $origin);

		// Add popover info to origin so that we can know when it has a popover
		$origin.data("popover", $popover);

		// Get various height, width and offset values
		winheight = $(window).height();
		winwidth = $(window).width();

		originoffset = $origin.offset();
		originheight = $origin.outerHeight();
		originwidth = $origin.outerWidth();

		spacetop = originoffset.top - $(document).scrollTop() + (originheight / 2);
		spacebottom = winheight - spacetop;
		spaceleft = originoffset.left - $(document).scrollLeft() + ( originwidth / 2 );
		spaceright = winwidth - spaceleft;

		// Add event listeners to the document for dismissing the popover
		// Namspace the event listeners so we can safely remove them later
		$(document).on("click.popover-" + id, function(e) {
			// Dismiss when clicked on outside of popover
			if (!$(e.target).closest($popover).length) {
				self.dismiss();
			}
		}).on("keydown.popover-" + id, function(e) {
			// Dismiss when escape (27) is pressed
			if (e.which === 27) {
				self.dismiss();
			}
		});

		// Add the popover to the DOM
		// We are attaching it early so we can get width and height
		// Which is needed for calculating position
		$popover.appendTo(settings.parent);

		// Let's also include the margin in the height and width (flag: true)
		popoverwidth = $popover.outerWidth(true);
		popoverheight = $popover.outerHeight(true);
		popovermargin = popoverwidth - $popover.outerWidth();

		if (originoffset.left < 0 || originoffset.left > winwidth) {
			// Origin is outside of visible area, towards left/right
			classnames += " arrow-y popover-origin-outside";

			if (spacetop <= (popoverheight / 2)) {
				classnames += " arrow-top";
			} else if (spacebottom <= (popoverheight / 2)) {
				classnames += " arrow-bottom";
			}

			// The arrow points to the opposite direction of popover direction
			if (originoffset.left < 0) {
				classnames += " popover-right";
				spaceleft = 0;
			} else {
				classnames += " popover-left";
				spaceleft = winwidth - popoverwidth;
			}
		} else if (originoffset.top < 0 || originoffset.top > winheight) {
			// Origin is outside of visible area, towards top/right
			classnames += " arrow-x popover-origin-outside";

			if (spaceleft < originwidth / 2) {
				classnames += " arrow-left";
			} else if (spaceright < originwidth / 2) {
				classnames += " arrow-right";
			}

			if (originoffset.top < 0) {
				classnames += " popover-bottom";
				spacetop = 0;
			} else {
				classnames += " popover-top";
				spacetop = winheight - popoverheight;
			}
		} else {
			// Origin is inside visible area
			classnames += " arrow-x";

			if (spaceleft <= (popoverwidth / 2)) {
				classnames += " arrow-left";
				spaceleft = originwidth / 2;
			} else if (spaceright <= (popoverwidth / 2)) {
				classnames += " arrow-right";
				spaceleft = winwidth - ( originwidth / 2 ) - popoverwidth;
			} else {
				spaceleft = spaceleft - ( popoverwidth / 2 );
			}

			if (popoverheight >= spacebottom) {
				classnames += " popover-top";
				spacetop = spacetop - originheight - popoverheight;
			} else {
				classnames += " popover-bottom";
				spacetop = (originheight <= winheight) ? spacetop : (winheight / 2);
			}

			spacetop += originheight / 2;
		}

		// Add the necessary positioning styles
		$popover.addClass(classnames).css({
			top: spacetop,
			left: spaceleft
		});

		// Popover is now initialized
		$.event.trigger("popoverInited", [ $popover ]);
	},

	/**
	 * Cleanup popover.
	 */
	destroy: function() {
		var $element = self.element ? $(self.element) : $(".popover-body");

		// The element doesn't exist
		if (!$element.length) {
			return;
		}

		// Loop through all elements and cleanup one by one
		$element.each(function() {
			var $this = $(this),
				origin = $this.data("popover-origin"),
				id = $this.data("popover-id"),
				classList = $this.attr("class").trim() || "";

			// Remove added classes
			classList = classList.replace(/\b(arrow-|popover-)\S+/g, "").trim();

			// Remove event listeners
			$(document).off("click.popover-" + id + " keydown.popover-" + id);

			// Cleanup data and styles
			$(origin).removeData("popover");

			$this.removeData("popover-id").removeData("popover-origin").css({
				top: "",
				left: "",
				opacity: ""
			}).addClass(classList);
		});
	},

	/**
	 * Dismiss popover.
	 */
	dismiss: function() {
		var self = this,
			$element = self.element ? $(self.element) : $(".popover-body"),
			$el, id,
			cleanup = function() {
				self.destroy();
				$element.remove();

				// Popover is now dismissed
				$.event.trigger("popoverDismissed", [ $element ]);
			};

		// The element doesn't exist
		if (!$element.length) {
			return;
		}

		// Remove the element from DOM
		if ($.fn.velocity) {
			$element.velocity("fadeOut", 150, function() {
				cleanup();
			});
		} else {
			cleanup();
		}
	}
});
