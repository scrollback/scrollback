/* jshint browser:true */
/* global libsb, $ */

var config = require("../client-config.js");
require('../lib/phonegap-polyfill.js');

function loginWithFb() {
	window.open("https:" + config.server.host + "/r/facebook/login", "_blank", "location=no");
}

$('.js-phonegap-fb-login').click(loginWithFb);

libsb.on('auth-menu', function(menu, next) {
	menu.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: loginWithFb

	};
	next();
}, 1000);
