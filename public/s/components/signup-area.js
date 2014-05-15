/* jshint browser: true */
/* global $, libsb, lace */

$(function(){
	var signingUser, signupId;
	$(document).on("click", ".signup-save", function(){
		console.log(signingUser);
		libsb.emit("user-up", {
			type: "user",
			user:{
				id: $("#signup-id").val(),
				identities: signingUser.identities,
			}
		}, function(err, u){
			console.log("user signup sent", u);
			signupId = u.id;
		});
	});
	libsb.on("error-dn", function(action, next) {
		console.log(action);
		next();
	});

	libsb.on("user-dn", function(action, next) {
		libsb.emit('navigate', {
			view: 'normal',
			mode: 'normal',
			tab: 'info'
		});
		console.log("user-dn");
		next();
	}, 500);

	libsb.on("init-dn", function(init, next) {
		if(init.auth && init.user.identities && !init.user.id ) {
			if(init.resource == libsb.resource) {
				signingUser = init.user;

				libsb.emit('navigate', {
					mode: "user", tab: "create", source: "libsb", view: "signup"
				});

				lace.modal.show($("#signup-dialog").html());
			}
		}
		next();
	},1000);

	$(document).on("click", ".signup-cancel", function(){
		libsb.emit('navigate', {
			view: 'normal',
			mode: 'normal',
			tab: 'info'
		});
	});
});
