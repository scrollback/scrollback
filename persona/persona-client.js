/* global libsb, navigator */

//(function(){
//	$(document).on("click", ".button.persona", function() {
//		navigator.id.watch({
//			onlogin: function(assertion){
//				var action = {};
//				action.auth = {
//					browserid: assertion
//				};
//				libsb.emit("init-up", action, function(err, data) {});
//			},
//			onlogout: function() {
//				// will get there soon enough.
//			}
//		});
//		navigator.id.request();
//	});
//})();

var persona = {
	text: "Email",
	prio: 200,
	action: function() {
		navigator.id.watch({
			onlogin: function(assertion) {
				var action = {};

				action.auth = {
					browserid: assertion
				};

				libsb.emit("init-up", action, function() {});
			},
			onlogout: function() {
				// will get there soon enough.
			}
		});
		navigator.id.request();
	}
};

libsb.on('auth-menu', function(menu, next) {
	menu.buttons.persona = persona;

	next();
}, 1000);

libsb.on("auth-dialog", function(dialog, next) {
	dialog.buttons.persona = persona;

	next();
}, 500);
