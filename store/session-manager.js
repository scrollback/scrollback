/* jshint browser:true */

var core, config, store;
module.exports = function(c, conf, s) {
	var LS = window.localStorage, session, domain = "", key = "";
	core = c;
	config = conf;
	store = s;
	core.on("boot", function(changes, next) {
		var embed;
		if (changes.context && changes.context.env == "embed") {
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