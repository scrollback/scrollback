/* jshint browser:true */
/* global libsb */

function sendInit(token) {
	/* sends init with the auth token */
	if (!token) return;
	libsb.emit("init-up", {
		auth: {
			gmail: {
				token: token
			}
		}
	}, function() {});
}

libsb.on('logout', function(l, n) {
	if (window.plugins && window.plugins.googleplus) {
		window.plugins.logout(function(msg) {
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
		window.plugins.googleplus.logout(function(m) {
			console.log("Logged out", m);
		});
		window.plugins.googleplus.login({},
			function(obj) {
				//successCallback
				logged_in = true;
				console.log("Login with Google+ successfull", obj);
				sendInit(obj.oauthToken);
			},
			function(msg) {
				//errorCallback
				console.log("Login with Google+ failed", msg);
			});
		if (isGuest && !logged_in) {
			interval_id = setInterval(function() {
				console.log("Trying silent login");
				window.plugins.googleplus.trySilentLogin({},
					function(obj) {
						logged_in = true;
						console.log("Silent lgn success", JSON.stringify(obj));
						clearInterval(interval_id);
					},
					function(msg) {
						console.log('Silent login for google+ failed: ' + msg);
					}
				);
			}, 1000);
		}
	} else {
		// usual login flow with inapp browser.
	}
}

module.exports = loginWithGoogle;