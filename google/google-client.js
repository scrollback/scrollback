/* jshint browser:true */
/* global libsb, $*/
var config = require("../client-config.js");

function loginWithGoogle() {
	window.open("https:" + config.server.host + "/r/google/login", "_blank", "location=no");
}

$('.js-phonegap-fb-login').click(loginWithGoogle);

libsb.on('auth-menu', function(menu, next) {
	menu.buttons.google = {
		text: 'Google',
		prio: 100,
		action: loginWithGoogle
	};
	next();
}, 1000);
