/* jshint browser: true */
/* global $ */

module.exports = function(core) {
	var done = false;

	core.on("statechange", function(changes, next) {
		if (done) {
			return next();
		}

		if (changes.nav && changes.nav.mode) {
			done = true;

			// We aren't really certain if the classes are added to body yet
			$.progressbar("dismiss");
		}

		next();
	}, 100);
};
