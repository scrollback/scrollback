/* jshint browser: true */
/* global $ */

"use strict";

module.exports = function(core) {
	function dismissLoading(changes, next) {
		if (changes.nav && changes.nav.mode) {
			// We aren't really certain if the classes are added to body yet
			$.progressbar("dismiss");

			core.off("statechange", dismissLoading);
		}

		next();
	}

	core.on("statechange", dismissLoading, 100);
};
