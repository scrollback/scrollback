"use strict";
module.exports = function(core, config, store) {
	core.on("init-user-up", function(payload, next) {
		var currentTimezone = -(new Date().getTimezoneOffset());
		if (store.getUser().timezone === currentTimezone) return next();
		payload.timezone = currentTimezone;
		next();
	});
};
