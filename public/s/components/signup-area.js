/* jshint browser: true */
/* global $, libsb */


$(function(){
	var signingUser;
	$(document).on("click", ".signup-save", function(){
		console.log(signingUser);
		libsb.emit("user-up", {
			type: "user",
			user:{
				id: $("#signup-id").val(),
				identities: signingUser.identities,
			}
		}, function(){
			console.log("user signup sent");
		});
	});

	libsb.on("user-dn", function(action, next) {
		libsb.emit('navigate', {
			room: "scrollback",
			view: 'normal',
			mode: 'normal',
			tab: 'info'
		});
		console.log("user-dn");
		next();
	}, 500);

	$(document).on("click", ".signup-cancel", function(){
		libsb.emit('navigate', {
			room: "scrollback",
			view: 'normal',
			mode: 'normal',
			tab: 'info'
		});
	});
	
	libsb.on("init-dn", function(init, next) {
		if(init.auth && init.user.identities && !init.user.id ) {
			if(init.resource == libsb.resource) {
				signingUser = init.user;

				$("body").removeClass("popover-active");
				$(".popover-body").removeClass("popover-bottom").removeClass("popover-top").removeClass("arrow-left").removeClass("arrow-right");
				$(".layer").remove();

				libsb.emit('navigate', {
					mode: "user", tab: "create", source: "libsb", view: "signup"
				});
			}
		}
		next();
	},1000);
});