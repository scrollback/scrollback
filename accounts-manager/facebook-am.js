/* jshint browser:true */
/* global libsb, facebookConnectPlugin */

libsb.on('logout', function(l, n) {
	if (window.plugins && window.plugins.facebookConnectPlugin) {
		facebookConnectPlugin.logout(function() {
			// success
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

function loginWithFacebook() {
	if (window.plugins && window.plugins.facebookConnectPlugin) {
		facebookConnectPlugin.login([], function(obj) {
			// login success
			console.log("Login succeeded", obj);
		}, function(msg) {
			// login failed
			console.log("Login failed", msg);
		});
	} else {
		// proceed with regular in-app browser based login.
	}
}

module.exports = loginWithFacebook;