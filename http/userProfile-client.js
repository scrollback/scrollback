/* jshint browser: true */
/* global $, libsb */

//user profile settings
var formField = require("../lib/formField.js");
libsb.on('pref-show', function(tabs, next) {
	var $avatar, $about,
		description, picture;

	description = tabs.user ? tabs.user.description : "";
	picture = tabs.user ? tabs.user.picture : "";

	$avatar = formField("Picture", null, "pref-user-avatar", $("<a>").append(
		$("<img>").attr("src", picture),
		$("<span>").addClass("label").text("Change")
	).attr({
		href: "http://gravatar.com/emails",
		target: "_blank"
	}).addClass("pref-user-avatar"));

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

libsb.on('pref-save', function(user, next) {
	user.description = $('#pref-about-me').val();
	user.identities = libsb.user.identities;

	next();
}, 500);
