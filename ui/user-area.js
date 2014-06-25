/* jshint browser: true */
/* global $, libsb, currentState */

var showMenu = require('./showmenu.js');
$(function () {
	var lace = require("../lib/lace.js");

	$(document).on("click", ".popover-body a", function () {
		lace.popover.hide();
	});

//	$(".user-area, .user-menu-button").on("click", function () {
//		if ($("body").hasClass("role-guest")) {
//			lace.popover.show({
//				body: $("#login-menu").html(),
//				origin: $(this)
//			});
//		} else {
//			lace.popover.show({
//				body: $("#user-menu").html(),
//				origin: $(this)
//			});
//		}
//	});

	$(".user-area").on('click', function(){
		if($('body').hasClass('role-user')){
			libsb.emit('user-menu', {origin: $('.user-area'), buttons: {}, items: {}}, function(err, menu){
				showMenu(menu);
			});
		} else if($('body').hasClass('role-guest')){
			libsb.emit('auth-menu', {origin: $('.user-area'), buttons: {}, title: 'Login to Scrollback with'}, function(err, menu){
				showMenu(menu);
			});
		}
	});

	libsb.on('user-menu', function(menu, next){
		menu.items.userpref = {
			text: 'My Account',
			prio: 300,
			action: function(){
				libsb.emit("navigate",{
					mode: "pref",
					view: "meta"
				});
			}
		};
		next();
	}, 1000);
	
//	$(document).on("click", ".userpref", function () {
//		libsb.emit("navigate", {
//			mode: "pref",
//			view: "meta"
//		});
//	});

//	$(document).on("click", ".logout", function () {
//		libsb.logout();
//	});

	libsb.on("logout", function (p, n) {
		libsb.emit('navigate', {
			view: 'loggedout',
		});

		lace.modal.show({
			body: $("#signedout-dialog").html(),
			dismiss: false
		});

		n();
	}, 1000);

	$(document).on("click", ".reload-page", function () {
		location.reload();
	});

	libsb.on('navigate', function (state, next) {
		if (state && (!state.old || state.roomName != state.old.roomName)) {
			var room = state.roomName;
			$("#room-title").text(room);
		}
		next();
	}, 100);

	function setOwnerClass() {
		function check() {
			libsb.getRooms({hasMember: libsb.user.id}, function(err, data) {
				var i, l;

				for(i=0,l=data.results.length;i<l;i++) {
					if(data.results[i].id == currentState.roomName) {
						if (data.results[i].role === "owner") {
							$("body").addClass("role-owner");
							return;
						}
					}
				}

				$("body").removeClass("role-owner");
			});
		}


		if(libsb.isInited) {check();}
		else {
			libsb.on('inited', function(d, next) {
				check();
				next();
            }, 100);
		}
	}

	libsb.on('init-dn', function(init, next){
		setOwnerClass();
		next();
	}, 100);

	libsb.on('back-dn', function(init, next){
		setOwnerClass();
		next();
	}, 100);

	libsb.on('navigate', function(state, next) {
            if(state.mode == 'normal' && state.roomName) {
                setOwnerClass();
            }
            next();
	}, 100);
	
	libsb.on("init-dn", function (init, next) {
		console.log("*************");
		if (init.auth && !init.user.id) return next();
		
		if (/^guest-/.test(init.user.id)) {
			$("body").removeClass("role-user").addClass("role-guest");
		} else {
			$("body").removeClass("role-guest").addClass("role-user");
		}

		$("#sb-user").text = init.user.id.replace(/^guest-/, '');
		$("#sb-avatar").attr("src", init.user.picture);
		$("#sb-user").text(init.user.id.replace(/^guest-/, ''));

		next();
	}, 100);
});
