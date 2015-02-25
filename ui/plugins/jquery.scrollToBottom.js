/* jshint browser: true */
/* global jQuery */

(function($) {

	$.fn.scrollToBottom = function() {
		var $this = $(this);

		if ($.fn.velocity) {
			$this.children().last().velocity("scroll", {
				duration: 150,
				container: $this
			});
		} else {
			$this.get(0).scrollTop = $this.get(0).scrollHeight;
		}

		return this;
	};

})(jQuery);
