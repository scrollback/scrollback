/* jshint browser: true */
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
	var isInited = false;
	var backQueue = [];

	libsb.on("init-dn", function (action, next) {
		isInited = true;
		backQueue.forEach(function (e) {
			e();
		});
		next();
	}, 1000);

	libsb.on("init-up", function (action, next) {
		if (libsb.hasBooted) return next();
		actionQueue.enQueue(next);
	}, 1000);
	libsb.on("back-up", function (action, next) {
		if (!isInited) {
			backQueue.push(next);
			return;
		}
		return next();
	}, 1000);

	libsb.on("navigate", function (state, next) {
		if (state.source == "boot") return next();
		if (state.connectionStatus === false) isInited = false;

		if (!libsb.hasBooted) {
			// add more sources if the navigate has to be queued up.
			if (["socket"].indexOf(state.source) >= 0) return actionQueue.enQueue(next);
			return next(new Error("BOOT_NOT_COMPLETE"));
		}
		next();
	}, 1000);
}

module.exports = function (l) {
	init(l);
};