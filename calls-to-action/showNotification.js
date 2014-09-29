/* jshint browser:true */
/* global $, lace */

var shownActions = {};
var notificationQueue = [];
var intervalSet = false;

if (localStorage.hasOwnProperty('shownActions')) {
	// shownActions = JSON.parse(localStorage.shownActions);
}

var userActions = {
	signIn: "Sign into Scrollback to pick a nickname.",
	choosePic: "Choose a picture and set your preferences in Account Settings.",
	enableNotifications: "Turn on Desktop notifications in your account settings to get notified when people address you.",
	followRoom: "Follow this room to stay in the loop even when you are offline.",
	browseArchives: "Did you know that you can browse the archives by discussion?",
	searchArchives: "Did you know that you can search the chat archives?"
};

function notify(action) {
	if (shownActions[action.notificationName] !== true) {
		lace.popover.show({
			origin: action.origin,
			body: userActions[action.notificationName]
		});
		shownActions[action.notificationName] = true;
		localStorage.shownActions = JSON.stringify(shownActions);
	}
}

function isNotifyOn() {
	if ($('.popover-body').length > 0) return true;
	else return false;
}

function fireNotification() {
	intervalSet = true;
	var intervalId = setInterval(function () {
		if (isNotifyOn()) {
			return;
		} else if (notificationQueue.length === 0) {
			clearInterval(intervalId);
			intervalSet = false;
		} else {
			// fire the first notification in the queue
			notify(notificationQueue.shift());
		}
	}, 3000);
}


function showNotification(origin, notificationName) {
	notificationQueue.push({
		origin: origin,
		notificationName: notificationName
	});
	if (intervalSet === false) fireNotification();
}

module.exports = showNotification;