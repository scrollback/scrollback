/* jshint browser:true */
/* global libsb, lace, $, currentState */

// var timeOnline;

var shownActions = {};

if (localStorage.hasOwnProperty('shownActions')) {
	// shownActions = JSON.parse(localStorage.shownActions);
}

var userActions = {
	signIn: "Sign into Scrollback to pick a nickname.",
	choosePic: "Choose a picture and set your preferences in Account Settings.",
	enableNotifications: "Turn on Desktop notifications in your account settings to get notified when people address you.",
	followRoom: "Follow this room to stay in the loop even when you are offline.",
	viewDiscussions: "Did you know that you can browse archives by discussion?",
	searchArchives: "Did you know that you can search the chat archives?"
};

function showNotification(origin, notifcationName) {
	setTimeout(function () {
		if (shownActions[notifcationName] !== true) {
			lace.popover.show({
				origin: origin,
				body: userActions[notifcationName]
			});
			shownActions[notifcationName] = true;
			localStorage.shownActions = JSON.stringify(shownActions);
		}
	}, 2000);
}

libsb.on('text-up', function (text, next) {
	if (!/^guest-/.test(libsb.user.id)) {
		showNotification($('.follow-button'), 'followRoom');
	} else {
		showNotification($('.user-area'), 'signIn');
	}
	next();
}, 800);

$('.chat-entry').click(function () {
	if (!/^guest-/.test(libsb.user.id)) return;
	showNotification($('.user-area'), 'signIn');
});

libsb.on('user-dn', function (user, next) {
	if (!/^guest-/.test(user.from)) return next(); // not a new signup
	showNotification($('.user-area'), 'choosePic');
	next();
}, 800);

function prefNotify(user) {
	if (user.params.notifications.desktop === false) {
		showNotification($('.user-area'), 'enableNotifications');
	}
}

libsb.on('pref-save', function (user, next) {
	prefNotify(user);
	next();
}, 100);

$(".conf-cancel").on("click", function () {
	if (window.currentState.mode === "pref") {
		prefNotify(libsb.user);
	}
});

libsb.on('init-dn', function (init, next) {
	if (init.user && !/^guest-/.test(init.user.id)) { // user has signed in.
		// if user is signed in, but not a follower, show the notification.
		libsb.emit("getUsers", {
			memberOf: currentState.roomName,
			ref: libsb.user.id
		}, function (e, user) {
			if (user.results && user.results.length === 0) {
				showNotification($('.follow-button'), 'followRoom');
			}
		});
	}
	next();
}, 500);