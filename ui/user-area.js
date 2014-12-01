/* jshint browser: true */
/* global $, libsb, currentState */

var showMenu = require("./showmenu.js");

$(function() {
	var $userAvatar = $(".sb-avatar"),
		$userName = $(".sb-user"),
		$roomTitle = $("#room-title");

	$(document).on("click", ".js-has-auth-menu", function() {
		if ($("body").hasClass("role-guest")) {
			libsb.emit("auth-menu", {
				origin: $(this),
				buttons: {},
				items: {},
				title: "Sign in to Scrollback with"
			}, function(err, menu) {
				showMenu("auth-menu", menu);
			});
		}
	});

	$(document).on("click", ".js-has-user-menu", function() {
		if ($("body").hasClass("role-user")) {
			libsb.emit("user-menu", {
				origin: $(this),
				buttons: {},
				items: {}
			}, function(err, menu) {
				showMenu("user-menu", menu);
			});
		}
	});

	function setOwner() {
		var isOwner = false;

		if (libsb.memberOf) {
			libsb.memberOf.forEach(function(room) {
				if (room.id === window.currentState.roomName && room.role === "owner") {
					isOwner = true;
				}
			});
		}

		if (isOwner) {
			$("body").addClass("role-owner");
		} else {
			$("body").removeClass("role-owner");
		}
	}

	function setUser() {
		if (!libsb || !libsb.user || !libsb.user.id) {
			return;
		}

		if (/^guest-/.test(libsb.user.id)) {
			$("body").removeClass("role-user").addClass("role-guest");
		} else {
			$("body").removeClass("role-guest").addClass("role-user");
		}

		$userAvatar.attr("src", libsb.user.picture);
		$userName.text(libsb.user.id.replace(/^guest-/, ""));
	}

	libsb.on("auth-menu", function(menu, next) {
		libsb.emit("auth", menu, function() {
			next();
		});
	}, 100);

	libsb.on("init-dn", function(init, next) {
		if (init.auth && !init.user.id) {
			return next();
		}

		setOwner();
		setUser();

		next();
	}, 100);

	libsb.on("back-dn", function(init, next) {
		setOwner();
		setUser();

		next();
	}, 100);
	libsb.on("user-dn", function(action, next) {
		$userAvatar.attr("src", action.user.picture);
		next();
	}, 100);

	libsb.on("navigate", function(state, next) {
		if (state && state.old && state.roomName && state.roomName !== state.old.roomName) {
			$roomTitle.text(state.roomName);
			setOwner();
		}

		if (state.source === "boot") {
			setUser();
		}

		next();
	}, 100);

	libsb.on("room-dn", function(action, next) {
		if(action.to === currentState.roomName) setOwner();
		next();
	}, 25);

	libsb.on("logout", function(action, next) {
		libsb.emit("navigate", { dialog: "logout" });

		next();
	}, 100);

	libsb.on("logout-dialog", function(dialog, next) {
		dialog.title = "You've been signed out!";
		dialog.action = {
			text: "Go back as guest",
			action: function() {
				libsb.emit("navigate", { dialog: null }, function() {
					window.location.reload();
				});
			}
		};
		dialog.dismiss = false;

		next();
	}, 500);
});
