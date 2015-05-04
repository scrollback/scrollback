/* jshint browser:true */

"use strict";

module.exports = function(core) {
	var LS = window.localStorage, session, domain = "", key = "";

	core.on("boot", function(changes, next) {
		var embed;
		if (changes.context && changes.context.env === "embed" && changes.context.embed && changes.context.embed.jws) {
			embed = changes.context.embed;
			domain = embed.origin.host;
		}
		key = domain +(domain?"_":"")+"session";
		session = LS.getItem(key);
		next();
	}, 700);
	core.on("init-up", function(initUp, next) {
		if(session) initUp.session = session;
		next();
	}, 999);

	core.on("init-dn", function(initDn, next) {
		LS.setItem(key, initDn.session);
		session = initDn.session;
		next();
	}, 999);

	core.on("logout", function(logout, next) {
		LS.removeItem(key);
		next();
	}, 1000);
};
