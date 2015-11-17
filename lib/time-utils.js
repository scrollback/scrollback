"use strict";

var msPerSec = 1000;
var msPerMin = msPerSec * 60;
var msPerHour = msPerMin * 60;
var msPerDay = msPerHour * 24;
var msPerWeek = msPerDay * 7;
var msPerMonth = msPerWeek * 30;
var msPerYear = msPerMonth * 365;

var weekDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

function short(time, now) {
	if (typeof now !== "number") {
		now = Date.now();
	}

	var diff = now - time;

	if (diff < 0) {
		if (diff > msPerMin) {
			return "future";
		} else {
			return "now";
		}
	} else if (diff < msPerMin) {
		return Math.round(diff / msPerSec) + "s";
	} else if (diff < msPerHour) {
		return Math.round(diff / msPerMin) + "m";
	} else if (diff < msPerDay) {
		return Math.round(diff / msPerHour) + "h";
	} else if (diff < msPerYear) {
		return Math.round(diff / msPerDay) + "d";
	} else {
		return Math.round(diff / msPerYear) + "y";
	}
}

function long(time, now) {
	if (typeof now !== "number") {
		now = Date.now();
	}

	var diff = now - time;

	if (diff < 0) {
		if (diff > msPerMin) {
			return "Future";
		} else {
			return "Just now";
		}
	} else if (diff < msPerMin) {
		return "Just now";
	} else if (diff < msPerHour) {
		var m = Math.round(diff / msPerMin);

		return m + " minute" + (m > 1 ? "s" : "") + " ago";
	} else if (diff < msPerDay) {
		var h = Math.round(diff / msPerHour);

		return h + " hour" + (h > 1 ? "s" : "") + " ago";
	} else {
		var date = new Date(time);
		var currentDate = new Date(now);

		var timeStr;

		if (diff < msPerWeek) {
			var day = date.getDay();

			if (Math.round(diff / msPerDay) <= 1 && day !== currentDate.getDay()) {
				timeStr = "Yesterday";
			} else {
				timeStr = weekDays[day];
			}
		} else {
			var year = date.getFullYear();

			timeStr = (year !== currentDate.getFullYear() ? year + " " : "") + months[date.getMonth()] + " " + date.getDate();
		}

		var minutes = date.getMinutes();

		return (timeStr ? (timeStr + " at ") : "") + date.getHours() + ":" + (minutes < 10 ? "0" : "") + minutes;
	}
}

module.exports = {
	short: short,
	long: long
};