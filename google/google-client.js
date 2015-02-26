/* jshint browser:true */
/* global $ */

module.exports = function(core, config) {
	function loginWithGoogle() {
		window.open("https:" + config.server.host + "/r/google/login", "_blank", "location=no");
	}

	$('.js-cordova-google-login').click(loginWithGoogle);

	core.on('auth', function(auth, next) {
		auth.buttons.google = {
			text: 'Google',
			prio: 100,
			action: loginWithGoogle
		};

		next();
	}, 700);
};
