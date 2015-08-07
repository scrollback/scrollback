/* global $ */

"use strict";
module.exports = function(core) {
	core.on("error-dn", function(e, n) {
		if (!e.handled) {
			$("<div>").text(e.message).alertbar({
				type: "error"
			});
		}
		n();
	});
};
