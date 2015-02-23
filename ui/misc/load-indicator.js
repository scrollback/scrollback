/* jshint browser: true */
/* global $ */

module.exports = function(core) {
	var done = false;

	core.on("statechange", function(changes, next) {
		if (done) {
			return next();
		}

		if ("nav" in changes && "mode" in changes.nav) {
			done = true;

			// We aren't really certain if the classes are added to body yet
			$.progressbar("dismiss");
		}

		next();
	}, 100);
};
