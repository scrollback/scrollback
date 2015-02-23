/* jshint browser: true */
/* global $, libsb */

$(function() {
	var errmsg;

	libsb.on("error-dn", function(err, next) {

		switch (err.message) {
			case "ERR_IRC_NOT_CONNECTED":
				errmsg = "We are having some issues with irc. Please try again after some time";
				break;
		}

		if (errmsg) {
			$("<div>").text(errmsg).alertbar({
				type: "error"
			});
		}

		next();
	}, 500);

	libsb.on("disconnected", function(payload, next) {
		libsb.emit("navigate", {
			mode: "offline"
		});

		next();
	}, 900);

	$(".offline-view-reconnect").on("click", function() {
		location.reload();
	});
});
