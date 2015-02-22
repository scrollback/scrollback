/* jshint browser:true */
/* global $ */

module.exports = function(core, config, state) {
	var desktopnotify = require("../lib/desktopnotify.js"),
		showNotification = require("./showNotification.js"),
		$appbarMore = $(".appbar-icon-more"),
		$appbarFollow = $(".appbar-icon-follow");

	$(".chat-input").on("click", function() {
		// TODO: ignore in embed
		if (!/^guest-/.test(state.get("user")) || state.getNav().mode !== "chat") {
			return;
		}

		showNotification($appbarMore, "signIn");
	});

	core.on("text-up", function(text, next) {
		if (state.getNav().mode !== "chat") {
			return next();
		}

		if (!/^guest-/.test(state.get("user"))) {
			showNotification($appbarFollow, "followRoom");
		} else {
			showNotification($appbarMore, "signIn");
		}

		next();
	}, 800);

	core.on("user-dn", function(user, next) {
		if (!/^guest-/.test(user.from) || !/(chat|conf|pref)/.test(state.getNav().mode)) {
			return next(); // not a new signup
		}

		showNotification($appbarMore, "choosePic");

		next();
	}, 800);

	core.on("statechange", function(changes, next) {
		var notify;

		if ("nav" in changes && "mode" in changes.nav && state.getNav().mode !== "pref") {
			notify = desktopnotify.supported();

			if (notify && notify.permission !== "granted") {
				showNotification(".list-item-notification-settings", "desktopNotifications");
			}
		}

		next();
	}, 100);

	core.on("init-dn", function(init, next) {
		if (init.user && !/^guest-/.test(init.user.id) && state.getNav().mode === "chat") {
			// If user is signed in, but not a follower, show the notification.
			core.emit("getUsers", {
				memberOf: state.getNav().room,
				ref: state.get("user")
			}, function(e, user) {
				if (user.results && user.results.length === 0) {
					showNotification($appbarFollow, "followRoom");
				}
			});
		}

		next();
	}, 500);
};
