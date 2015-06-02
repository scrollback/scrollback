/* jshint browser:true */
/* eslint no-shadow: 0*/
/* eslint no-undef: 0*/
"use strict";
module.exports = function(core, config, store) {
	var login;

	function androidLogin() {
		if (window.Android && typeof window.Android.facebookLogin === "function") {
			window.Android.facebookLogin();
		}
	}

	function webLogin() {
		window.open("https://" + config.server.host + "/r/facebook/login", "_blank", "location=no");
	}

	login = {
		web: webLogin,
		embed: webLogin,
		android: androidLogin
	};

	core.on("boot", function(state, next) {
		core.on('auth', function(auth, next) {
			auth.buttons.facebook = {
				text: 'Facebook',
				prio: 100,
				action: login[store.get("context", "env") || "web"]
			};

			next();
		}, 700);

		next();
	}, 100);


	core.on('error-dn', function(error, next) {
		if (error.message === "ERR_FB_LOGIN_NO_EMAIL") {
			$("<div>").html("Facebook did not provide your email address, which is needed to sign you in. Please try again.").
			alertbar({ type: "error" });
		}

		next();
	}, 1000);

};
