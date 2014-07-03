/* jshint browser: true */
/* global $, libsb */

$(function() {
	if (window.parent.postMessage) {
		// Handle fullview button click
		$(".full-view-action").on("click", function() {
			window.open((window.location.href).replace(/[&,?]embed=[^&,?]+/g, "").replace(/[&,?]theme=[^&,?]+/g, "").replace(/[&,?]minimize=[^&,?]+/g, ""), "_blank");
		});

		// Handle minimize
		$(".title-bar").on("click", function(e) {
			if (e.target === e.currentTarget || e.target === $("#room-title")[0]) {
				libsb.emit("navigate", { minimize: true });
			}
		});

		$(".minimize-bar").on("click", function() {
			libsb.emit("navigate", { minimize: false });
		});

		libsb.on("navigate", function(state, next) {
			if (state.embed === "toast" && state.old && state.minimize !== state.old.minimize) {
				if (state.minimize) {
					window.parent.postMessage("minimize", "*");
				} else {
					window.parent.postMessage("maximize", "*");
				}
			}
			
			next();
		}, 500);
	}
});
