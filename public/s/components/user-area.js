/* jshint browser: true */
/* global $, libsb, lace */

$(function(){
	$(document).on("click", ".popover-body a", function() {
		lace.popover.hide();
	});

	$(".user-area").on("click", function() {
		if ($("body").hasClass("guest-user")) {
			lace.popover.show($(this), $("#login-menu").html());
		} else {
			lace.popover.show($(this), $("#user-menu").html());
		}
	});

	$(document).on("click", ".button.facebook", function() {
		window.open(location.protocol+"//"+location.host+"/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');
	});

	$(document).on("click", ".userpref", function() {
		libsb.emit("navigate", {
			mode: "pref",
		});
	});

	$(document).on("click", ".logout", function() {
		libsb.logout();
	});

	libsb.on("logout", function(p,n) {
		libsb.emit('navigate', {
			view: 'loggedout',
		});

		lace.modal.show($("#loggedout-dialog").html());

		n();
	}, 1000);

	$(document).on("click", ".reload-page", function(){
		location.reload();
	});

	libsb.on('navigate', function(state, next) {
		if(state && (!state.old || state.room != state.old.room)) {
			var room = state.room;
			$("#room-title").text(room);
		}

		next();
	});


	libsb.on("init-dn", function(init, next) {
		if(init.auth && !init.user.id) return next();

		if(/^guest-/.test(init.user.id)) {
			$("body").addClass("guest-user");
		} else {
			$("body").removeClass("guest-user");
		}

		$("#sb-user").text = init.user.id.replace(/^guest-/,'');

		if(/^guest-/.test(init.user.id)) {
			$("body").addClass("guest-user");
		} else {
			$("body").removeClass("guest-user");
		}

		$("#sb-avatar").attr("src", init.user.picture);
		$("#sb-user").text(init.user.id.replace(/^guest-/,''));

		next();
	}, 1000);
});





