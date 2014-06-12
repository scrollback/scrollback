/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

$(function() {
	var msgarr = [],
		checkMsg = function() {
			var $bar = $(".minimize-bar");

			if (msgarr.length) {
				$bar.removeClass("no-messages");
		    } else {
			    $bar.addClass("no-messages");
		    }
		};

	libsb.on("text-dn", function(text, next) {
		msgarr.push(text.text);

		if (msgarr.length > 3) {
			msgarr = msgarr.splice(Math.max(msgarr.length - 3, 1));
		}

		checkMsg();

		next();
	});
});
