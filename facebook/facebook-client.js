/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var loginWithAccManager = require("./facebook-am-client.js")(core, config, store);

	function loginWithFb() {
		if (typeof facebookConnectPlugin !== "undefined") {
			loginWithAccManager();
		} else {
			window.open("https://" + config.server.host + "/r/facebook/login", "_blank", "location=no");
		}
	}

	$('.js-cordova-fb-login').click(loginWithFb);

	core.on('auth', function(auth, next) {
		auth.buttons.facebook = {
			text: 'Facebook',
			prio: 100,
			action: loginWithFb
		};

		next();
	}, 600);
};
