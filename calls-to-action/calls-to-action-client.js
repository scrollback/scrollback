/* jshint browser:true */
/* global libsb, $, currentState */

var desktopnotify = require("../ui/desktopnotify.js"),
	showNotification = require("./showNotification.js"),
	$userArea = $(".user-area"),
	$followButton = $(".follow-button"),
	$threadsTab = $(".tab-threads");

$(".chat-input").on("click", function() {
	if (!/^guest-/.test(libsb.user.id) || window.currentState.mode !== "normal" || (window.currentState.embed && libsb.user.isSuggested)) {
		return;
	}

	showNotification([$userArea, '.meta-button-back'], "signIn");
});

libsb.on("text-up", function(text, next) {
	if (window.currentState.mode !== "normal") {
		return next();
	}

	if (!/^guest-/.test(libsb.user.id)) {
		showNotification($followButton, "followRoom");
	} else {
		showNotification([$userArea, '.meta-button-back'], "signIn");
	}

	next();
}, 800);

libsb.on("user-dn", function(user, next) {
	if (!/^guest-/.test(user.from) || !/(normal|conf|pref)/.test(window.currentState.mode)) {
		return next(); // not a new signup
	}

	showNotification([$userArea, '.meta-button-back'], "choosePic");

	next();
}, 800);

libsb.on("navigate", function(state, next) {
	var notify;

	if (state && state.old && state.old.mode !== state.mode && state.mode === "pref") {
		notify = desktopnotify.supported();

		if (notify && notify.permission !== "granted") {
			showNotification(".list-item-notification-settings", "desktopNotifications");
		}
	}

	next();
}, 100);

libsb.on("init-dn", function(init, next) {
	if (init.user && !/^guest-/.test(init.user.id) && window.currentState.mode === "normal") {
		// If user is signed in, but not a follower, show the notification.
		libsb.emit("getUsers", {
			memberOf: currentState.roomName,
			ref: libsb.user.id
		}, function(e, user) {
			if (user.results && user.results.length === 0) {
				showNotification($followButton, "followRoom");
			}
		});
	}

	next();
}, 500);

libsb.on("navigate", function(state, next) {
	if (state && state.source === "chat-area" && state.old && state.time && state.time !== state.old.time && window.currentState.mode === "normal") {
		showNotification([$threadsTab, '.meta-button-back'], "browseArchives");
	}

	next();
}, 100);
