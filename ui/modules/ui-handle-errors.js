/* global $ */

"use strict";

module.exports = function(core, config, store) {
	var mode = store.get("nav").mode;
	core.on("error-dn", function(e, n) {
		if (!e.handled && mode !== "loading") {
			$("<div>").text(e.message).alertbar({
				type: "error"
			});
		}
		n();
	}, 1);
};
