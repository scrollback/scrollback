/* jshint browser:true */
/* global libsb, $ */
var $googlebutton = $('.js-cordova-google-login');

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

var interval_id; // required since the successCallback is not reliably fired in case of multiple accounts

function loginWithGoogle() {
	var logged_in = false;

	var isGuest = libsb && libsb.user && (/^guest-/).test(libsb.user.id);
	if (window.plugins && window.plugins.googleplus) {
		$googlebutton.addClass('working');
		window.plugins.googleplus.login({},
			function(obj) {
				//successCallback
				logged_in = true;
				$googlebutton.removeClass('working');
				console.log("Login with Google+ successfull", obj);
				sendInit(obj.oauthToken);
			},
			function(msg) {
				//errorCallback
				console.log("Login with Google+ failed", msg);
				$googlebutton.removeClass('working');
			});
		if (isGuest && !logged_in) {
			if (interval_id) {
				clearInterval(interval_id);
				interval_id = null;
			}
			interval_id = setInterval(function() {
				console.log("Trying silent login");
				window.plugins.googleplus.trySilentLogin({},
					function(obj) {
						logged_in = true;
						console.log("Silent lgn success", JSON.stringify(obj));
						sendInit(obj.oauthToken);
						clearInterval(interval_id);
						interval_id = null;
					},
					function(msg) {
						console.log('Silent login for google+ failed: ' + msg);
					}
				);
			}, 1000);
			libsb.on('init-dn', function(i, n) {
				// clear all intervals used for polling.
				// multiple intervals get added if user clicks the login button multiple times.
				clearInterval(interval_id);
				interval_id = null;
				$googlebutton.removeClass('working');
				n();
			}, 500);
		}
	}
}

module.exports = loginWithGoogle;
