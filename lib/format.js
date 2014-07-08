/* jslint browser: true, regexp: true */
/* exported format */

window.format = {
	friendlyTime: function (time, currTime) {
		var date = new Date(parseInt(time, 10)),
			now = new Date(currTime),
			elapsed = currTime - time,
			msPerMinute = 60 * 1000,
			msPerHour = msPerMinute * 60,
			msPerDay = msPerHour * 24,
			minDiff = Math.round(elapsed/msPerMinute),
			dayDiff = Math.round(elapsed/msPerDay),
			weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday",
						"Thursday", "Friday", "Saturday"],
			months = ["January", "February", "March", "April",
					  "May", "June", "July", "August", "September",
					  "October", "November", "December"],
			str = "";

		if (isNaN(date.getTime()) || isNaN(now.getTime())) {
			return "Sometime";
		}

		if (dayDiff > 6) {
			str += months[date.getMonth()] + " " + date.getDate();
			str = (date.getFullYear() !== now.getFullYear() ? date.getFullYear() + " ": "") + str;
		} else {
			if (minDiff < 1) {
				return "Just now";
			} else if (minDiff < 15) {
				return minDiff + " minute" + ((minDiff > 1) ? "s" : "") + " ago";
			}

			str = str || dayDiff > 1 ? weekDays[date.getDay()] : date.getDay() != now.getDay() ? "Yesterday" : "";
		}

		return (str ? (str + " at ") : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
	},
	htmlToText: function(html) {
		if (html) {
			return html.replace(/<[^>]*>/g, function(m) {
				return (
					/^<br/.test(m) || /^<p/.test(m) || /^<div/.test(m) ||
					/^<\/p/.test(m) || /^<\/div/.test(m)
				)? "\n": ' ';
			}).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim()
			.replace(/&#(\d+);/g, function(m, d) {
				return String.fromCharCode(d);
			});
		}
	},

	textToHtml: function(str) {
		// Replace &, <, >, ", ', `, ‘, !, @, $, %, (, ), =, +, {, }, [, and ]
		if (str) {
			return str.replace(/&/g, "&amp;")
						.replace(/</g, "&lt;").replace(/>/g, "&gt;")
						.replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;").replace(/‘/g, "&#x27;")
						.replace(/!/g, "&#33;").replace(/@/g, "&#64;")
						.replace(/\$/g, "&#36;").replace(/%/g, "&#37;")
						.replace(/\(/g, "&#40;").replace(/\)/g, "&#41;")
						.replace(/=/g, "&#61;").replace(/\+/g, "&#43;")
						.replace(/{/g, "&#123;").replace(/}/g, "&#125;")
						.replace(/\[/g, "&#91;").replace("]", "&#93;")
						.replace(/ /g, "&#32;").replace(/(?:\r\n|\r|\n)/g, "<br />").trim();
		}
	},

	linkify: function(str) {
		if(typeof str !== "string") return;
		var urlPattern = /\b(https?\:\/\/)?([\w.\-]*@)?((?:[a-z0-9\-]+)(?:\.[a-z0-9\-]+)*(?:\.[a-z]{2,4}))((?:\/|\?)\S*)?\b/g;
		var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		var emailAddressPattern = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;

		return str
		.replace(urlPattern, '<a href="$&" rel="nofollow" target="_blank">$&</a>')
		.replace(pseudoUrlPattern, '$1<a rel="nofollow" href="http://$2" target="_blank">$2</a>')
		.replace(emailAddressPattern, '<a href="mailto:$&" target="_blank">$&</a>');
	},

	sanitize: function(str) {
		str = str.trim().replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
		if(str.length < 3) str = str + Array(4-str.length).join("-");
		str = str.substring(0, 32);
		return str;
	}
};
