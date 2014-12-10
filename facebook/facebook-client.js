/* jshint browser:true */
/* global libsb, $, currentState */
var config = require("../client-config.js");

function getParameterByName(name, url) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loginWithFb() {
	var fbRef = window.open("https:" + config.server.host + "/r/facebook/login", "_blank", "location=no");
	if (currentState.phonegap) {
		var interval = setInterval(function() {
			fbRef.executeScript({
				code: "window.location.href;"
			}, function(ret) {
				var url = ret[0];
				var code = getParameterByName('code', url);

				if (code !== null) {
					var auth = {
						command: "signin",
						auth: {
							facebook: {
								code: code
							}
						}
					};
					$(window).trigger("phonegapmsg", [auth]);
					clearInterval(interval);
					fbRef.close();
				}
			});
		}, 100);
	}
}

$('.js-phonegap-fb-login').click(loginWithFb);

libsb.on('auth', function(auth, next) {
	auth.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: loginWithFb

	};

	next();
}, 600);
