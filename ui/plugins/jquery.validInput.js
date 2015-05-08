/* eslint-env browser */
/* global jQuery */

(function($) {
	"use strict";

	$.fn.validInput = function(validator) {
		var $this = $(this),
			value = $this.val();

		if (typeof validator !== "function") {
			return this;
		}

		validator(value, function(message) {
			var $errorPopOver = $this.data("errorMsg");

			if (typeof message === "undefined") {
				$this.removeClass("error");

				if ($errorPopOver) {
					$errorPopOver.popover("dismiss");
				}

				return;
			}

			$this.addClass("error");

			$errorPopOver = $("<div>").addClass("error").append(
				$("<div>").addClass("popover-content").text(message)
			).popover({ origin: $this });

			$this.data("errorMsg", $errorPopOver);

			$(document).off("modalDismissed.validinput").on("modalDismissed.validinput", function() {
				$errorPopOver.popover("dismiss");
			});

			$this.off("change.validinput input.validinput paste.validinput").on("change.validinput input.validinput paste.validinput", function() {
				$errorPopOver.popover("dismiss");

				$(this).removeClass("error");
			});

			$this.focus();
		});

		return this;
	};

})(jQuery);
