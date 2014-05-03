$(function(){
	function hidePopOver() {
		$(".popover-body").removeClass().addClass("popover-body").empty();
		$(".layer").remove();
	}

	$(".has-popover").on("click", function() {
		hidePopOver();
	});

	$(".user-area").on("click", function() {
		if ($("body").hasClass("guest-user")) {
			$(".popover-body").addClass("user-menu").append('Sign in to scrollback with<a class="button facebook">Facebook</a><a class="button persona">Persona</a>');
		} else {
			$(".popover-body").addClass("user-menu").append('<ul><li><a href="">Report an issue</a></li><li><a class="logout" href="#">Logout</a></li></ul>');
		}	
	});

	$(document).on("click", ".button.facebook", function() {
		window.open(location.protocol+"//"+location.host+"/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');
		hidePopOver();
	});
	$(document).on("click", ".logout", function() {
		libsb.emit("logout");
		hidePopOver();
	});
	




	libsb.on('navigate', function(state, next) {
		if(state && (!state.old || state.room != state.old.room)) {
			room = state.room;
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





