/* jshint browser:true */
/* global libsb, lace, $ */

// var timeOnline;

var shownActions = {};

var userActions = {
	signIn : "Sign into Scrollback to pick a nickname.",
	choosePic: "Choose a picture and set your preferences in Account Settings",
	enableNotifications: "Turn on Desktop notifications to get notified when people address you.",
	followRoom: "Follow this room to stay in the loop even when you are offline",
	viewDiscussions: "Did you know that you can browse archives by discussion?",
	searchArchives: "Did you know that you can search the chat archives?"
};

function showNotification(origin, notifcationName) {
	if(shownActions[notifcationName] !== true) {
		lace.popover.show({origin: origin, body: userActions[notifcationName]});
		shownActions[notifcationName] = true;
	}
}

libsb.on('text-up', function (text, next) {
	if(!/^guest-/.test(libsb.user.id)) return next(); // action does not apply to non guests
	showNotification($('.user-area'), 'signIn');
	next();
}, 800);

$('.chat-entry').click(function () {
	if(!/^guest-/.test(libsb.user.id)) return;
	showNotification($('.user-area'), 'signIn');
});