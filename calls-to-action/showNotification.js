/* jshint browser:true */
/* global $ */

var userActions = require('./notification-strings-en.js'),
	shownActions = {},
	notificationQueue = [],
	intervalSet = false;

if (localStorage.hasOwnProperty('shownActions')) {
	shownActions = JSON.parse(localStorage.shownActions);
}

function notify(action) {
	if (shownActions[action.notificationName] !== true) {
		$("<div>").addClass("popover-calls-to-action").text(userActions[action.notificationName]).popover({ origin: action.origin });

		shownActions[action.notificationName] = true;
		localStorage.shownActions = JSON.stringify(shownActions);
	}
}

function isNotifyOn() {
	return ($('.popover-body').length > 0);
}

function fireNotification() {
	intervalSet = true;

	var intervalId = setInterval(function() {
		if (isNotifyOn()) {
			return;
		} else if (notificationQueue.length === 0) {
			clearInterval(intervalId);
			intervalSet = false;
		} else {
			// fire the first notification in the queue
			notify(notificationQueue.shift());
		}
	}, 2000);
}

function showNotification(origin, notificationName) {
	notificationQueue.push({
		origin: origin,
		notificationName: notificationName
	});

	if (intervalSet === false) {
		fireNotification();
	}
}

module.exports = showNotification;
