/* jshint browser:true */
/* global libsb, $, currentState */

var showNotification = require('./showNotification.js');

libsb.on('text-up', function(text, next) {
	if (!/^guest-/.test(libsb.user.id)) {
		showNotification($('.follow-button'), 'followRoom');
	} else {
		showNotification($('.user-area'), 'signIn');
	}
	next();
}, 800);

$('.chat-entry').click(function() {
	if (!/^guest-/.test(libsb.user.id)) return;
	showNotification($('.user-area'), 'signIn');
});

libsb.on('user-dn', function(user, next) {
	if (!/^guest-/.test(user.from)) return next(); // not a new signup
	showNotification($('.user-area'), 'choosePic');
	next();
}, 800);

function prefNotify(user) {
	if (user.params.notifications.desktop === false) {
		showNotification($('.user-area'), 'enableNotifications');
	}
}

libsb.on('pref-save', function(user, next) {
	prefNotify(user);
	next();
}, 100);

$(".conf-cancel").on("click", function() {
	if (window.currentState.mode === "pref") {
		prefNotify(libsb.user);
	}
});

libsb.on('init-dn', function(init, next) {
	if (init.user && !/^guest-/.test(init.user.id)) { // user has signed in.
		// if user is signed in, but not a follower, show the notification.
		libsb.emit("getUsers", {
			memberOf: currentState.roomName,
			ref: libsb.user.id
		}, function(e, user) {
			if (user.results && user.results.length === 0) {
				showNotification($('.follow-button'), 'followRoom');
			}
		});
	}
	next();
}, 500);

libsb.on("getTexts", function(query, next) {
	if (query.hasOwnProperty('before') && query.before > 0 && query.time !== null) { // user has scrolled up.
		showNotification($('.tab-threads'), 'browseArchives');
		showNotification($('.search-button'), 'searchArchives');
	}
	next();
}, 100);