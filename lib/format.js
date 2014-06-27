/* jslint browser: true, regexp: true */
/* exported format */

window.format = {
	friendlyTime: function (previous, current) {
		var date = new Date(parseInt(previous, 10)),
			now = new Date(parseInt(current, 10)),
			msPerMinute = 60 * 1000,
			msPerHour = msPerMinute * 60,
			msPerDay = msPerHour * 24,
			msPerWeek = msPerDay * 7,
			msPerMonth = msPerDay * 30,
			msPerYear = msPerDay * 365,
			weekDays=["Sunday", "Monday", "Tuesday", "Wednesday",
					  "Thursday", "Friday", "Saturday"],
			monthNames=["January", "February", "March", "April",
					"May", "June", "July", "August", "September",
					"October", "November", "December"];

		if (isNaN(date.getTime()) || isNaN(now.getTime())) {
			return "Sometime";
		}

		var elapsed = current - previous;

		if (elapsed < msPerMinute) {
			return "Just now";
		} else if (elapsed < msPerHour) {
			var minutes = Math.round(elapsed/msPerMinute);

			return minutes + " minute" + ((minutes > 1) ? "s" : "") + " ago";
		} else if (elapsed < msPerDay ) {
			var hours = Math.round(elapsed/msPerHour);

			return (hours === 1) ? "Last hour" : hours + " hours ago";
		} else if (elapsed < msPerWeek) {
			var days = Math.round(elapsed/msPerDay);

			if (days === 1) {
				return "Yesterday";
			} else {
				return "Last " + weekDays[date.getDay()];
			}
		} else if (elapsed < msPerMonth) {
			var weeks = Math.round(elapsed/msPerWeek);

			if (weeks === 1) {
				return weekDays[date.getDay()] + ", " + "last week";
			} else {
				return weekDays[date.getDay()] + ", " + weeks + " weeks ago";
			}
		} else if (elapsed < msPerYear) {
			var months = Math.round(elapsed/msPerMonth);

			if (months === 1) {
				return date.getDate() + ", last month";
			} else {
				return date.getDate() + ", " + monthNames[date.getMonth()];
			}
		} else {
			var years = Math.round(elapsed/msPerYear);

			if (years === 1) {
				return date.getDate() + ", " + monthNames[date.getMonth()] + ", last year";
			} else {
				return date.getDate() + ", " + monthNames[date.getMonth()] + ", " + date.getFullYear();
			}
		}
	},

	htmlToText: function(html) {
		return html.replace(/<[^>]*>/g, function(m) {
			return (
				/^<br/.test(m) || /^<p/.test(m) || /^<div/.test(m) ||
				/^<\/p/.test(m) || /^<\/div/.test(m)
			)? "\n": ' ';
		}).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/, ' ')
		.replace(/&#(\d+);/g, function(m, d) {
			return String.fromCharCode(d);
		}).trim();
	},

	textToHtml: function(str) {
		// Replace &, <, >, ", ', `, , !, @, $, %, (, ), =, +, {, }, [, and ]
		if (str) {
			return str.replace("&", "&amp;")
							.replace("<", "&lt;").replace(">", "&gt;").replace("/", "&#x2F;")
							.replace('"', "&quot;").replace("'", "&#39;").replace("`", "&#96;").replace("‘", "&#x27;")
							.replace("!", "&#33;").replace("@", "&#64;")
							.replace("$", "&#36;").replace("%", "&#37;")
							.replace("(", "&#40;").replace(")", "&#41;")
							.replace("=", "&#61;").replace("+", "&#43;")
							.replace("{", "&#123;").replace("}", "&#125;")
							.replace("[", "&#91;").replace("]", "&#93;")
							.replace(" ", "&#32;").replace(/(?:\r\n|\r|\n)/g, '<br />');
		}
	},

	linkify: function(str) {
		var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
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
