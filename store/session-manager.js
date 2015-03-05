/* jshint browser:true */

var core, config, store;
module.exports = function(c, conf, s) {
	var LS = window.localStorage, session;
	core = c;
	config = conf;
	store = s;
	session = LS.getItem("session");
	core.on("init-up", function(initUp, next) {
		if(session) initUp.session = session;
		next();
	}, 999);
	
	core.on("init-dn", function(initDn, next) {
		LS.setItem("session", initDn.session);
		next();
	}, 999);
};