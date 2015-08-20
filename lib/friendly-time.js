"use strict";

module.exports = function(time, currTime) {
	var date = new Date(parseInt(time, 10)),
		now = new Date(currTime),
		elapsed = currTime - time,
		msPerMinute = 60 * 1000,
		msPerHour = msPerMinute * 60,
		msPerDay = msPerHour * 24,
		minDiff = Math.round(elapsed / msPerMinute),
		dayDiff = Math.round(elapsed / msPerDay),
		weekDays = [ "Sunday", "Monday", "Tuesday",
					 "Wednesday", "Thursday", "Friday",
					 "Saturday" ],
		months = [ "January", "February", "March", "April",
				   "May", "June", "July", "August", "September",
				   "October", "November", "December" ],
		str = "";

	if (isNaN(date.getTime()) || isNaN(now.getTime())) {
		return "Sometime";
	}

	if (dayDiff > 6) {
		str += months[date.getMonth()] + " " + date.getDate();
		str = (date.getFullYear() !== now.getFullYear() ? date.getFullYear() + " " : "") + str;
	} else {
		if (minDiff < 1) {
			return "Just now";
		} else if (minDiff < 15) {
			return minDiff + " minute" + ((minDiff > 1) ? "s" : "") + " ago";
		}

		if (!str) {
			if (dayDiff > 1) {
				str = weekDays[date.getDay()];
			} else if (date.getDay() !== now.getDay()) {
				str = "Yesterday";
			} else {
				str = "";
			}
		}
	}

	return (str ? (str + " at ") : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
};
