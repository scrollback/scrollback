/* jshint browser:true */
/* global libsb, facebookConnectPlugin */
var config = require("../client-config-defaults.js");

libsb.on('logout', function(l, n) {
	if (facebookConnectPlugin) {
		facebookConnectPlugin.logout(function() {
			// success
			console.log("Sucessfully logged out from Facebook");
			return n();
		}, function() {
			// failure
			console.log("Facebook plugin logout failure");
			return n();
		});
	} else {
		return n();
	}
}, 500);

function sendInit(token) {
	if (!token) {
		return;
	}
	libsb.emit("init-up", {
		auth: {
			facebook: {
				token: token
			}
		}
	}, function() {

	});
}

function loginWithFacebook() {
	if (facebookConnectPlugin) {
		facebookConnectPlugin.login([], function(obj) {
			// login success
			console.log("Login succeeded", obj);
			sendInit(obj.authResponse.accessToken);
		}, function(msg) {
			// login failed
			console.log("Login failed", msg);
		});
	}
}

module.exports = loginWithFacebook;