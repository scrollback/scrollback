/* jshint browser: true */
/* global $, libsb */

$(function(){
	function hidePopOver() {
		$(".popover-body").removeClass().addClass("popover-body").empty();
		$(".layer").remove();
	}

	$(".has-popover").on("click", function() {
		hidePopOver();
	});

	$(document).on("click", ".popover-body a", function() {
		hidePopOver();
	});

	$(".user-area").on("click", function() {
		if ($("body").hasClass("guest-user")) {
			$(".popover-body").addClass("user-menu").append('Sign in to scrollback with<a class="button facebook">Facebook</a><a class="button persona">Persona</a>');
		} else {
			$(".popover-body").addClass("user-menu").append('<ul><li><a class="userprefs">Account settings</a></li><li><a class="reportissue" target="_blank" href="https://github.com/scrollback/scrollback/issues">Report an issue</a></li><li><a class="logout">Logout</a></li></ul>');
		}
	});

	$(document).on("click", ".button.facebook", function() {
		window.open(location.protocol+"//"+location.host+"/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');
	});

	$(document).on("click", ".userprefs", function() {
		libsb.emit("navigate", {
			mode: "pref",
		});
	});

	$(document).on("click", ".logout", function() {
		libsb.logout();
	});

	libsb.on('navigate', function(state, next) {
		if(state && (!state.old || state.room != state.old.room)) {
			var room = state.room;
			$("#roomTitle").text(room);
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

		$(".sb-user")[0].innerText = init.user.id.replace(/^guest-/,'');

		if(/^guest-/.test(init.user.id)) {
			$("body").addClass("guest-user");
		} else {
			$("body").removeClass("guest-user");
		}

		$("#userGrav").attr("src", init.user.picture);
		$(".sb-user").text(init.user.id.replace(/^guest-/,''));
		next();
	}, 1000);
});





