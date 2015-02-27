/* jshint browser: true */
/* global $ */

var formField = require("../ui/utils/form-field.js"),
	pictureSelected = "",
	pictureList = [];

module.exports = function(core, config, store) {
	core.on("init-dn", function(action, next) {
		pictureSelected = action.user.picture;
		pictureList = action.user.params.pictures;
		if (!pictureList && !/^guest-/.test(action.user.id)) {
			pictureList = [pictureSelected];
		}
		next();
	}, 800);

	core.on("user-dn", function(action, next) {
		pictureSelected = action.user.picture;
		pictureList = action.user.params.pictures;
		if (!pictureList) {
			pictureList = [pictureSelected];
		}
		next();
	}, 800);

	core.on("user-up", function(action, next) {
		action.user.picture = pictureSelected;
		if (pictureList) {
			action.user.params.pictures = pictureList;
		}

		next();
	}, 100);

	core.on('pref-show', function(tabs, next) {
		var $avatar, $about,
			description, picture;

		description = tabs.user ? tabs.user.description : "";
		picture = tabs.user ? tabs.user.picture : "";
		var imgList = [];
		if (tabs.user.params && !tabs.user.params.pictures) {
			tabs.user.params.pictures = pictureList;
		}

		if (tabs.user.params && tabs.user.params.pictures) {
			tabs.user.params.pictures.forEach(function(pic) {
				var ava = $("<div>").append(
					$("<img>").attr("src", pic)
				).addClass("pref-user-avatar").data("url", pic);

				if (pic === tabs.user.picture) {
					ava.addClass("current");
				}

				imgList.push(ava);
			});
		}

		$avatar = formField("Picture", null, "picture-list", imgList);

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

	$(document).on("click", ".pref-user-avatar", function(e) {
		var d = $(e.target).closest(".pref-user-avatar");
		$(".pref-user-avatar.current").removeClass("current");
		d.addClass("current");
	});

	core.on('pref-save', function(user, next) {
		user.description = $('#pref-about-me').val();
		user.identities = store.getUser().identities;
		pictureSelected = user.picture = $(".pref-user-avatar.current").data("url");

		next();
	}, 500);
};
