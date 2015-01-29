/* jshint browser:true */
/* global libsb, $, facebookConnectPlugin */

var config = require("../client-config-defaults.js");
var loginWithAccManager = require("./facebook-am-client.js");

function loginWithFb() {
	if (typeof facebookConnectPlugin !== "undefined") {
		loginWithAccManager();
	}
	window.open("https:" + config.server.host + "/r/facebook/login", "_blank", "location=no");
}

$('.js-cordova-fb-login').click(loginWithFb);

libsb.on('auth', function(auth, next) {
	auth.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: loginWithFb
	};

	next();
}, 600);