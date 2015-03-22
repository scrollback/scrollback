/* jshint browser: true */

module.exports = function(core, config, store) {
	var login;

	function androidLogin() {
		if (window.Android && typeof window.Android.googleLogin === "function") {
			window.Android.googleLogin();
		}
	}

	function webLogin() {
		window.open("https://" + config.server.host + "/r/google/login", "_blank", "location=no");
	}

	login = {
		web: webLogin,
		embed: webLogin,
		android: androidLogin
	};

	core.on("boot", function(state, next) {
		core.on('auth', function(auth, next) {
			auth.buttons.google = {
				text: 'Google',
				prio: 100,
				action: login[store.get("context", "env") || "web"]
			};

			next();
		}, 700);

		next();
	}, 100);
};
