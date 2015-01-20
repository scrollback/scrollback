/* jshint browser:true */
/* global libsb, $, facebookConnectPlugin */

var config = require("../client-config-defaults.js");

function loginWithFb() {
	window.open("https:" + config.server.host + "/r/facebook/login", "_blank", "location=no");
}

if (typeof facebookConnectPlugin === "undefined") {
	$('.js-phonegap-fb-login').click(loginWithFb);
}

libsb.on('auth', function(auth, next) {
	auth.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: loginWithFb

	};

	next();
}, 600);