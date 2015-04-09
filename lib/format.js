/* jshint browser: true */
/* global twemoji */

var MarkdownIt = require('markdown-it'),
	emoji = require('markdown-it-emoji/light.js'),
	md;

md = new MarkdownIt({
	linkify: true
});

md.use(emoji); // use the emoji plugin for remarkable.

module.exports = {
	mdToHtml: function(text) {
		var html;

		try {
			if (typeof twemoji !== "undefined") {
				html = twemoji.parse(md.render(text));
			} else {
				html = md.render(text);
			}
		} catch (e) {
			html = this.linkify(this.textToHtml(text || ""));
		}

		return (html || "").replace("<a href=", "<a rel='nofollow' target='_blank' href=");
	},
	friendlyTime: function(time, currTime) {
		var date = new Date(parseInt(time, 10)),
			now = new Date(currTime),
			elapsed = currTime - time,
			msPerMinute = 60 * 1000,
			msPerHour = msPerMinute * 60,
			msPerDay = msPerHour * 24,
			minDiff = Math.round(elapsed / msPerMinute),
			dayDiff = Math.round(elapsed / msPerDay),
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
			str = (date.getFullYear() !== now.getFullYear() ? date.getFullYear() + " " : "") + str;
		} else {
			if (minDiff < 1) {
				return "Just now";
			} else if (minDiff < 15) {
				return minDiff + " minute" + ((minDiff > 1) ? "s" : "") + " ago";
			}

			str = str || dayDiff > 1 ? weekDays[date.getDay()] : date.getDay() !== now.getDay() ? "Yesterday" : "";
		}

		return (str ? (str + " at ") : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
	},

	urlComponent: function(str) {
		return str.toLowerCase().trim().replace(/['"]/g, '').replace(/\W+/g, '-');
	},

	titleCase: function(str) {
		return str.split(/[\s\-]+/g).map(function(word) {
			return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
		}).join(' ');
	},

	htmlToText: function(html) {
		if (html && typeof html === "string") {
			return html.replace(/<[^>]*>/g, function(m) {
				return (
					/^<br/.test(m) || /^<p/.test(m) || /^<div/.test(m) ||
					/^<\/p/.test(m) || /^<\/div/.test(m)
				) ? "\n" : " ";
			}).
			replace(/\ +/, ' ').
			replace(/&lt;/g, '<').
			replace(/&gt;/g, '>').
			replace(/&amp;/g, '&').
			replace(/&quot;/g, '"').
			replace(/&nbsp;/g, ' ').
			replace(/&#(\d+);/g, function(m, d) {
				return String.fromCharCode(d);
			});
		} else {
			return "";
		}
	},

	textToHtml: function(str) {
		if (str && typeof str === "string") {
			return str.replace(/^\s+|\s+$/g, "") // Remove leading and ending new lines
						.replace(/&/g, "&#38")
						.replace(/</g, "&#60;").replace(/>/g, "&#62;")
						.replace(/"/g, "&#34").replace(/'/g, "&#39;")
						.replace(/(?:\r\n|\r|\n)/g, "<br />");
		} else {
			return "";
		}
	},

	linkify: function(text) {
		if (typeof text !== "string") {
			return;
		}

		var u = /\b(https?\:\/\/)?([\w.\-]*@)?((?:[a-z0-9\-]+)(?:\.[a-z0-9\-]+)*(?:\.[a-z]{2,4}))(:[0-9]{1,4})?((?:\/|\?)\S*)?\b/gi,
			m = "", s = 0, r,
			protocol, user, domain, port, path;

		while ((r = u.exec(text)) !== null) {
			m += text.substring(s, r.index);

			protocol = r[1];
			user = r[2];
			domain = r[3] || "";
			port = r[4] || "";
			path = r[5] || "";

			protocol = protocol || (user ? "mailto:" : "http://");

			user = user || "";

			s = u.lastIndex;

			m += "<a href='" + encodeURI(protocol + user + domain + path) + "'>" + r[0] + "</a>";
		}

		m += text.substring(s);

		return m;
	},

	sanitize: function(str) {
		str = str.trim().replace(/[^a-zA-Z0-9]/g, "-").replace(/^-+|-+$/, "");

		if (str.length < 3) {
			str = str + Array(4 - str.length).join("-");
		}

		str = str.substring(0, 32);
		return str;
	}
};
