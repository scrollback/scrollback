/* jshint browser: true */
/* global $, libsb */

//user profile settings
var formField = require("../lib/formField.js");
var pictureSelected = "";
var pictureList = [];

libsb.on("init-dn", function(action, next) {
	pictureSelected = action.user.picture;
	pictureList = action.user.params.pictures;
	next();
}, 100);

libsb.on("user-dn", function(action, next) {
	pictureSelected = action.user.picture;
	pictureList = action.user.params.pictures;
	next();
}, 100);

libsb.on("user-up", function(action, next) {
	action.user.picture = pictureSelected;
	if(pictureList) action.user.params.pictures = pictureList;
	next();
}, 100);

libsb.on('pref-show', function(tabs, next) {
	var $avatar, $about,
		description, picture;

	description = tabs.user ? tabs.user.description : "";
	picture = tabs.user ? tabs.user.picture : "";
	
	var imgList = [];
	
	if(tabs.user.params && tabs.user.params.pictures) {
		tabs.user.params.pictures.forEach(function(pic) {
			var ava = $("<span>").append(
				$("<img>").attr("src", pic)
			).addClass("pref-user-avatar").data("url", pic);;
			
			if(pic === tabs.user.picture) ava.addClass("current");
			imgList.push(ava);
		});
	}
	$avatar = formField("Picture", null, "pref-user-avatar", imgList);

	$about = formField("About me", "area", "pref-about-me", description);

	tabs.profile = {
		text: "Profile",
		html: $("<div>").append(
			$avatar,
			$about
		),
		prio: 1000
	};

	next();
}, 500);

$(document).on("click",".pref-user-avatar", function(e){
	var d = $(e.target).closest(".pref-user-avatar");
	pictureSelected = $(d).data("url");
	
});

libsb.on('pref-save', function(user, next) {
	console.log("pref-save:", user, pictureSelected);
	user.description = $('#pref-about-me').val();
	user.identities = libsb.user.identities;
	user.picture = pictureSelected;
	console.log(user);
	next();
}, 500);
