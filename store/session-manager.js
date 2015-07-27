/* eslint-env browser */

"use strict";

module.exports = function(core) {
	var key;

	core.on("boot", function(changes, next) {
		var context = changes.context,
			host = "";
		if (context && context.env === "embed" && context.init && changes.context.init.jws) {
			host = context.origin && context.origin.host;
		}
		key = (host ? host + "_" : "") + "session";
		next();
	}, 700);
	core.on("init-up", function(initUp) {
		initUp.session = localStorage.getItem(key);
	}, 999);

	core.on("init-dn", function(initDn) {
		localStorage.setItem(key, initDn.session);
	}, 999);

	core.on("logout", function() {
		localStorage.removeItem(key);
	}, 1000);
};
