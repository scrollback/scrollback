/* jshint browser: true */
/* global $, libsb */

var validate = require("../lib/validate.js");

$(function() {
	var signingUser, signingUp = false, $signupDialog;

	function submitUser() {
		var userId = $("#signup-id").val(),
			$alert;

		if (!validate(userId).isValid) {
			$alert = $("<div>").text("Entered username is invalid");

			$alert.alertbar({
				type: "error",
				timeout: 3000
			});

			return;
		}
		libsb.emit("user-up", {
			user: {
				id: userId,
				picture: signingUser.picture,
				identities: signingUser.identities,
				params: {
					pictures: signingUser.pictures
				},
				guides: {}
			}
		}, function(err) {
			signingUp = true;

			if (err) {
				if (err.message == "ERR_USER_EXISTS") {
					$alert = $("<div>").text("Username already taken");
				} else {
					$alert = $("<div>").text(err.message);
				}

				$alert.alertbar({
					type: "error",
					timeout: 3000
				});
			}
		});
	}
	$(document).on("submit", "#signup", function(event) {
		submitUser();
		event.preventDefault();
	});
	$(document).on("click", ".signup-save", function() {
		submitUser();
	});

	/*libsb.on("error-dn", function(action, next) {
		console.log(action);
		next();
	});*/

	libsb.on("user-dn", function(action, next) {
		if ($signupDialog && $signupDialog.length) {
			$signupDialog.modal("dismiss");
		}

		next();
	}, 500);

	libsb.on("init-dn", function(init, next) {
		if (init.auth && init.user.identities && !init.user.id) {
			if (init.resource == libsb.resource) {
				signingUser = init.user;
				$signupDialog = $("<div>").html($("#signup-dialog").html()).modal();
			}
		}
		next();
	}, 1000);

	$(document).on("click", ".signup-cancel", function() {
		libsb.emit('navigate', {
			view: 'normal',
			mode: 'normal',
			tab: 'info'
		});
	});
});
