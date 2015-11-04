"use strict";

const msPerSec = 1000;
const msPerMin = msPerSec * 60;
const msPerHour = msPerMin * 60;
const msPerDay = msPerHour * 24;
const msPerWeek = msPerDay * 7;
const msPerMonth = msPerWeek * 30;
const msPerYear = msPerMonth * 365;

const weekDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

function short(time, now = Date.now()) {
	const diff = now - time;

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

function long(time, now = Date.now()) {
	const diff = now - time;

	if (diff < 0) {
		if (diff > msPerMin) {
			return "Future";
		} else {
			return "Just now";
		}
	} else if (diff < msPerMin) {
		return "Just now";
	} else if (diff < msPerHour) {
		const m = Math.round(diff / msPerMin);

		return m + " minute" + (m > 1 ? "s" : "") + " ago";
	} else if (diff < msPerDay) {
		const h = Math.round(diff / msPerHour);

		return h + " hour" + (h > 1 ? "s" : "") + " ago";
	} else {
		const date = new Date(time);
		const currentDate = new Date(now);

		let timeStr;

		if (diff < msPerWeek) {
			const day = date.getDay();

			if (Math.round(diff / msPerDay) <= 1 && day !== currentDate.getDay()) {
				timeStr = "Yesterday";
			} else {
				timeStr = weekDays[day];
			}
		} else {
			const year = date.getFullYear();

			timeStr = (year !== currentDate.getFullYear() ? year + " " : "") + months[date.getMonth()] + " " + date.getDate();
		}

		const minutes = date.getMinutes();

		return (timeStr ? (timeStr + " at ") : "") + date.getHours() + ":" + (minutes < 10 ? "0" : "") + minutes;
	}
}

export default { short, long };
