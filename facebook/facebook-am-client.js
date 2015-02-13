/* jshint browser:true */
/* global libsb, facebookConnectPlugin, $ */

var $fbbutton =  $('.js-cordova-fb-login');
var initSent = false;

libsb.on('logout', function(l, n) {
	if (typeof facebookConnectPlugin !== "undefined") {
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
	if (!token || initSent) {
		return;
	}
	initSent = true;
	libsb.emit("init-up", {
		auth: {
			facebook: {
				token: token
			}
		}
	}, function() {
		
	});
}

var intervalId;

function loginWithFacebook() {
	if (typeof facebookConnectPlugin !== "undefined") {
		$fbbutton.addClass('working');
		facebookConnectPlugin.login([], function(obj) {
			// login success
			console.log("Login succeeded", obj);
			sendInit(obj.authResponse.accessToken);
			$fbbutton.removeClass('working');
		}, function(msg) {
			// login failed, remove spinner
			console.log("Login failed", msg);
			$fbbutton.removeClass('working');
		});

		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		intervalId = setInterval(function() {
			console.log("in interval ", intervalId);
			facebookConnectPlugin.getLoginStatus(function(obj) {
				// this hack fires the callback when, the login is successfull, but success callback does not fire.
				// misbehaving phonegap plugins :-|
				console.log("login status", obj);
				if (obj.hasOwnProperty('status') && obj.status === "connected") {
					clearInterval(intervalId);
					intervalId = null;
					sendInit(obj.authResponse.accessToken);
				}
			}, function() {
				clearInterval(intervalId);
				intervalId = null;
			});
		}, 100);

		libsb.on('init-dn', function(i, n) {
			$fbbutton.removeClass('working');
			clearInterval(intervalId);
			intervalId = null;
			return n();
		}, 500);
	}
}

module.exports = loginWithFacebook;
