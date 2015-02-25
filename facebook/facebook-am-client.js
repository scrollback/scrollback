/* jshint browser:true */
/* global facebookConnectPlugin, $ */

module.exports = function(core) {
	var $fbbutton =  $(".js-cordova-fb-login"),
		initSent = false, intervalId;

	core.on("logout", function(logout, next) {
		if (typeof facebookConnectPlugin !== "undefined") {
			facebookConnectPlugin.logout(function() {
				// success
			}, function() {
				// failure
			});
		}

		next();
	}, 500);

	function sendInit(token) {
		if (!token || initSent) {
			return;
		}

		initSent = true;

		core.emit("init-up", {
			auth: {
				facebook: {
					token: token
				}
			}
		}, function() {

		});
	}

	function loginWithFacebook() {
		if (typeof facebookConnectPlugin !== "undefined") {
			$fbbutton.addClass("working");
			facebookConnectPlugin.login([], function(obj) {
				// login success
				console.log("Login succeeded", obj);
				sendInit(obj.authResponse.accessToken);
				$fbbutton.removeClass("working");
			}, function(msg) {
				// login failed, remove spinner
				console.log("Login failed", msg);
				$fbbutton.removeClass("working");
			});

			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}

			intervalId = setInterval(function() {
				facebookConnectPlugin.getLoginStatus(function(obj) {
					// this hack fires the callback when, the login is successfull, but success callback does not fire.
					// misbehaving phonegap plugins :-|
					if (obj.hasOwnProperty("status") && obj.status === "connected") {
						clearInterval(intervalId);
						intervalId = null;
						sendInit(obj.authResponse.accessToken);
					}
				}, function() {
					clearInterval(intervalId);
					intervalId = null;
				});
			}, 100);

			core.on("init-dn", function(i, n) {
				$fbbutton.removeClass("working");
				clearInterval(intervalId);
				intervalId = null;
				return n();
			}, 500);
		}
	}

	return loginWithFacebook;
};
