/* jshint browser: true */
/* global $ */

module.exports = function(core) {
	var $nick = $(".js-user-nick"),
		$description = $(".js-user-description"),
		$avatar = $(".js-user-avatar");

	core.on("statechange", function(changes, next) {
		var user;

		if ("user" in changes) {
			user = window.currentState.entities[changes.user];

			$nick.text(user.id);
			$description.text(user.description);
			$avatar.attr("src", user.picture);
		}

		next();
	}, 500);


	$(".js-follow-room").on("click", function() {
	    $("body").toggleClass("role-follower");
	});
};
