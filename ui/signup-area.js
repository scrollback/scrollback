/* jshint browser: true */
/* global $, libsb*/
var validate = require("../lib/validate.js");
$(function(){
	var lace = require("../lib/lace.js"),
		signingUser, signingUp = false;

	function submitUser() {
		var userId = $("#signup-id").val();
		if(!validate(userId)) {
			lace.alert.show({type:"error", body: "Entered username is invalid", timeout: 3000});
			return;
		}
		libsb.emit("user-up", {
			user: {
				id: userId,
				identities: signingUser.identities,
				params: {},
				guides: {}
            }
		}, function(err) {
                signingUp = true;
				if(err) {
					if(err.message == "ERR_USER_EXISTS"){
						lace.alert.show({type:"error", body: "Username already taken", timeout: 3000});
					}else {
						lace.alert.show({type:"error", body: err.message});
					}
				}
		});
	}
	$(document).on("submit", "#signup", function(event){
		submitUser();
		event.preventDefault();
	});
	$(document).on("click", ".signup-save", function(){
		submitUser();
	});

	/*libsb.on("error-dn", function(action, next) {
		console.log(action);
		next();
	});*/

	libsb.on("user-dn", function(action, next) {
		lace.modal.hide();

		if(signingUp === true) location.reload();

		libsb.emit('navigate', {
			view: 'normal',
			mode: 'normal',
			tab: 'info'
		});

		next();
	}, 500);

	libsb.on("init-dn", function(init, next) {
		if(init.auth && init.user.identities && !init.user.id ) {
			if(init.resource == libsb.resource) {
				signingUser = init.user;

				lace.modal.show({ body: $("#signup-dialog").html() });
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
