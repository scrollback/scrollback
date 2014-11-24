/* jshint browser:true */
/* global libsb, $, currentState*/
var config = require("../client-config.js");

function getParameterByName(name, url) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loginWithGoogle() {
	var googleRef = window.open("https:" + config.server.host + "/r/google/login", "_blank", "location=no");
	if (currentState.phonegap) {
		var interval = setInterval(function() {
			googleRef.executeScript({
				code: "window.location.href;"
			}, function(ret) {
				var url = ret[0];
				var code = getParameterByName('code', url);
				if (code !== null) {
					var auth = {
						command: "signin",
						auth: {
							google: {
								code: code
							}
						}
					};
					$(window).trigger("phonegapmsg", [auth]);
					clearInterval(interval);
					googleRef.close();
				}
			});
		}, 100);
	}
}

$('.js-phonegap-google-login').click(loginWithGoogle);

var google = {
	text: 'Google',
	prio: 100,
	action: loginWithGoogle
};

libsb.on('auth-menu', function(menu, next) {
	menu.buttons.google = google;

	next();
}, 1000);

libsb.on("auth-dialog", function(dialog, next) {
	dialog.buttons.google = google;

	next();
}, 300);
