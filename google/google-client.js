/* jshint browser:true */
/* global $,Android */

module.exports = function(core, config) {
	var env = "", login;
	
	function androidLogin() {
		if(Android)	Android.googleLogin();
	}
	
	function webLogin() {
		window.open("https://" + config.server.host + "/r/google/login", "_blank", "location=no");
	}
	
	login = {
		web: webLogin,
		embed: webLogin,
		android: androidLogin
	};
	
	core.on("boot", function(state, next) {
		env = state.context.env || "web";
		$('.js-cordova-google-login').click(login[env]);
		core.on('auth', function(auth, next) {
			auth.buttons.google = {
				text: 'Google',
				prio: 100,
				action: login[env]
			};

			next();
		}, 700);
		next();
	}, 100);	
};