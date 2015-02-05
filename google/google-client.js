/* jshint browser:true */
/* global libsb, $, currentState */

var config = require("../client-config-defaults.js");
var loginWithAccManager = require('./google-am-client.js');

function loginWithGoogle() {
	var hasGooglePlugin = window.plugins && window.plugins.googleplus;
	if(currentState.cordova && hasGooglePlugin) {
		loginWithAccManager();
	}
	else window.open("https:" + config.server.host + "/r/google/login", "_blank", "location=no");
}

$('.js-cordova-google-login').click(loginWithGoogle);

libsb.on('auth', function(auth, next) {
	auth.buttons.google = {
		text: 'Google',
		prio: 100,
		action: loginWithGoogle
	};

	next();
}, 700);
