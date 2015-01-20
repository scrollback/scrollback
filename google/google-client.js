/* jshint browser:true */
/* global libsb, $, currentState */

var config = require("../client-config-defaults.js");


function loginWithGoogle() {
	window.open("https:" + config.server.host + "/r/google/login", "_blank", "location=no");
}

var hasGooglePlugin = window.plugins && window.plugins.googleplus;

if (currentState.phonegap && !hasGooglePlugin) {
	$('.js-phonegap-google-login').click(loginWithGoogle);
}

libsb.on('auth', function(auth, next) {
	auth.buttons.google = {
		text: 'Google',
		prio: 100,
		action: loginWithGoogle
	};

	next();
}, 700);