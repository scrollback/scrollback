/* jshint browser: true */

module.exports = function(core) {
	var env = "";
	core.on("boot", function(state, next) {
		env = state.context.env || "web";

		if (state.context.env != "android") {
			core.on('auth', function(auth, next) {
				auth.buttons.persona = {
					text: "Email",
					prio: 200,
					action: function() {
						navigator.id.watch({
							onlogin: function(assertion) {
								var action = {};

								action.auth = {
									browserid: assertion
								};

								core.emit("init-up", action, function() {});
							},
							onlogout: function() {
								// will get there soon enough.
							}
						});

						navigator.id.request();
					}
				};

				next();
			}, 500);
		}
		next();
	}, 100);
};