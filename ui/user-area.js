/* jshint browser: true */
/* global $, libsb, currentState */

var showMenu = require('./showmenu.js');
var lace = require('../lib/lace.js');

$(function(){
	$(".user-area, .user-menu-button").on('click', function(){
	if($('body').hasClass('role-user')){
		libsb.emit('user-menu', {origin: $(this), buttons: {}, items: {}}, function(err, menu){
			showMenu(menu);
		});
	} else if($('body').hasClass('role-guest')){
		libsb.emit('auth-menu', {origin: $(this), buttons: {}, title: 'Sign in to Scrollback with'}, function(err, menu){
			showMenu(menu);
		});
	}
	});
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

libsb.on("logout", function (p, n) {
	console.log(new Error().stack);
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
	var room = currentState.roomName;
	if (state && (!state.old || state.roomName != state.old.roomName)) {
		$("#room-title").text(room);
	}
	next();
}, 100);

function setOwnerClass() {
	var isOwner = false;
	function check() {
		if(libsb.memberOf){
			libsb.memberOf.forEach(function(room){
				if(room.id === currentState.roomName && room.role === "owner"){
					$("body").addClass("role-owner");
					isOwner = true;
				}
			});
		}
		
		if(!isOwner) $("body").removeClass("role-owner");
	}
	check();
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
	if(state.source == "boot") {
		setUser();
	}
	next();
}, 100);

function setUser() {
	if (!libsb || !libsb.user || !libsb.user.id) return;
	$("#sb-avatar").attr("src", libsb.user.picture);
	$("#sb-user").text(libsb.user.id.replace(/^guest-/, ""));
}

libsb.on("init-dn", function (init, next) {
	if (init.auth && !init.user.id) return next();

	if (/^guest-/.test(init.user.id)) {
		$("body").removeClass("role-user").addClass("role-guest");
	} else {
		$("body").removeClass("role-guest").addClass("role-user");
	}
	
	setUser();
	next();
}, 100);
