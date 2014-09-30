/* jshint browser:true */
/* global $, lace */

var userActions = require('./notification-strings-en.js');

var shownActions = {};
var notificationQueue = [];
var intervalSet = false;

if (localStorage.hasOwnProperty('shownActions')) {
	 shownActions = JSON.parse(localStorage.shownActions);
}

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
	}, 2000);
}


function showNotification(origin, notificationName) {
	notificationQueue.push({
		origin: origin,
		notificationName: notificationName
	});
	if (intervalSet === false) fireNotification();
}

module.exports = showNotification;