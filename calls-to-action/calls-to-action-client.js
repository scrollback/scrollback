/* jshint browser:true */
/* global libsb, $, currentState */

var showNotification = require("./showNotification.js"),
	$userArea = $(".user-area"),
	$followButton = $(".follow-button"),
	$threadsTab = $(".tab-threads");

$(".chat-input").on("click", function () {
	if (!/^guest-/.test(libsb.user.id)) {
		return;
	}

	showNotification($userArea, "signIn");
});

libsb.on("text-up", function (text, next) {
	if (!/^guest-/.test(libsb.user.id)) {
		showNotification($followButton, "followRoom");
	} else {
		showNotification($userArea, "signIn");
	}

	next();
}, 800);

libsb.on("user-dn", function (user, next) {
	if (!/^guest-/.test(user.from)) {
		return next(); // not a new signup
	}

	showNotification($userArea, "choosePic");

	next();
}, 800);

libsb.on("navigate", function (state, next) {
	if (state && state.old && state.old.mode !== state.mode && state.mode === "pref") {
		showNotification(".list-item-notification-settings", "desktopNotifications");
	}

	next();
}, 100);

libsb.on("init-dn", function (init, next) {
	if (init.user && !/^guest-/.test(init.user.id)) { // user has signed in.
		// if user is signed in, but not a follower, show the notification.
		libsb.emit("getUsers", {
			memberOf: currentState.roomName,
			ref: libsb.user.id
		}, function (e, user) {
			if (user.results && user.results.length === 0) {
				showNotification($followButton, "followRoom");
			}
		});
	}

	next();
}, 500);

libsb.on("navigate", function (state, next) {
	if (state && state.source === "chat-area" && state.old && state.time && state.time !== state.old.time) {
		showNotification($threadsTab, "browseArchives");
	}

	next();
}, 100);