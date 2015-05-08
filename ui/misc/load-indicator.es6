/* eslint-env es6, browser */
/* global $ */

"use strict";

module.exports = (core) => {
	function dismissLoading(changes) {
		if (changes.nav && changes.nav.mode) {
			// We aren't really certain if the classes are added to body yet
			$.progressbar("dismiss");

			core.off("statechange", dismissLoading);
		}
	}

	core.on("statechange", dismissLoading, 100);
};
