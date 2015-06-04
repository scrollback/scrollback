/* eslint-env browser */
/* global $ */

"use strict";

var formField = require("../ui/utils/form-field.js"),
	getAvatar = require("../lib/get-avatar.js");

module.exports = function(core) {
	core.on("pref-show", function(tabs, next) {
		var $avatar, $about,
			user, avatars = [];

		user = tabs.user || {};
		user.params = user.params || {};

		if (user.params.pictures && user.params.pictures.length) {
			avatars = user.params.pictures.map(function(pic) {
				return $("<div>").append(
						$("<img>").attr("src", getAvatar(pic, 80))
					).data("url", pic).addClass("profile-user-avatar" + ((user.picture === pic) ? " current" : ""));
			});

			$avatar = formField("Picture", null, "profile-picture-list", avatars);

			$avatar.addClass("profile-picture-list");
		}

		$about = formField("About me", "area", "profile-about-me", user.description);

		tabs.profile = {
			text: "Profile",
			html: $("<div>").append(
				$avatar,
				$about
			)
		};

		next();
	}, 800);

	$(document).on("click", ".profile-user-avatar", function(e) {
		$(".profile-user-avatar.current").removeClass("current");

		$(e.target).closest(".profile-user-avatar").addClass("current");
	});

	core.on("pref-save", function(user, next) {
		user.description = $("#profile-about-me").val();
		user.picture = $(".profile-user-avatar.current").data("url");

		next();
	}, 500);
};
