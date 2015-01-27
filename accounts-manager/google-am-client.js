/* jshint browser:true */
/* global libsb, $ */
var config = require("../client-config-defaults.js");

function sendInit(token) {
	/* sends init with the auth token */
	if (!token) {
		return;
	}
	console.log("Sending INit", token);
	libsb.emit("init-up", {
		auth: {
			google: {
				token: token
			}
		}
	}, function() {});
}

libsb.on('logout', function(l, n) {
	if (window.plugins && window.plugins.googleplus) {
		window.plugins.googleplus.logout(function(msg) {
			console.log("got logout event, logging out", msg);
			return n();
		});
	} else {
		return n();
	}
}, 500);

function loginWithGoogle() {
	var logged_in = false,
		interval_id; // required since the successCallback is not reliably fired in case of multiple accounts
	var isGuest = libsb && libsb.user && (/^guest-/).test(libsb.user.id);
	if (window.plugins && window.plugins.googleplus) {
		require('./spinner.js');
		var $spinnerEl = $('#spinner');
		window.plugins.googleplus.logout(function(m) {
			console.log("Logged out", m);
			window.plugins.googleplus.login({},
				function(obj) {
					//successCallback
					logged_in = true;
					$spinnerEl.removeClass('spinner');
					console.log("Login with Google+ successfull", obj);
					sendInit(obj.oauthToken);
				},
				function(msg) {
					//errorCallback
					console.log("Login with Google+ failed", msg);
					$spinnerEl.removeClass('spinner');
				});
			if (isGuest && !logged_in) {
				var interval_id_arr = [];
				interval_id = setInterval(function() {
					interval_id_arr.push(interval_id);
					console.log("Trying silent login");
					window.plugins.googleplus.trySilentLogin({},
						function(obj) {
							logged_in = true;
							console.log("Silent lgn success", JSON.stringify(obj));
							sendInit(obj.oauthToken);
							clearInterval(interval_id);
						},
						function(msg) {
							console.log('Silent login for google+ failed: ' + msg);
						}
					);
				}, 1000);
				libsb.on('init-dn', function(i, n) {
					// clear all intervals used for polling.
					// multiple intervals get added if user clicks the login button multiple times.
					if (interval_id_arr.length) {
						console.log("Clearing all intervals ", interval_id_arr.length);
						interval_id_arr.forEach(function(interval) {
							clearInterval(interval);
						});
					}
					n();
				}, 500);
			}
		});
	} else {
		// usual login flow with inapp browser.
		window.open("https:" + config.server.host + "/r/google/login", "_blank", "location=no");
	}
}

module.exports = loginWithGoogle;
