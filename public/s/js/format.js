/* jslint browser: true, regexp: true */
/* exported format */

window.format = {
	friendlyTime: function (time, currTime) {
		var d = new Date(parseInt(time, 10)), n = new Date(currTime),
			day_diff = (n.getTime()-d.getTime())/86400000,
			weekDays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
				"Friday", "Saturday"],
			months=["January", "February", "March", "April", "May", "June", "July",
				"August", "September", "October", "November", "December"],
			str = "";

		if(isNaN(d.getTime()) || isNaN(n.getTime())) return "Sometime";

		if (day_diff > 6) {
			str+=months[d.getMonth()] + ' ' + d.getDate();
			str = (d.getFullYear() !== n.getFullYear()? d.getFullYear() + ' ': '')+str;
		}
		else{
			str = str || day_diff > 1? weekDays[d.getDay()]: d.getDay()!=n.getDay()?
			'Yesterday': '';
		}

		return (str? (str + ' at '): '') + d.getHours() + ':' +
			(d.getMinutes()<10? '0': '') + d.getMinutes();
	},

	htmlToText: function(html) {
		return html.replace(/<[^>]*>/g, function(m) {
			return (
				/^<br/.test(m) || /^<p/.test(m) || /^<div/.test(m) ||
				/^<\/p/.test(m) || /^<\/div/.test(m)
			)? "\n": ' ';
		}).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').
		replace(/&#(\d+);/g, function(m, d) {
			return String.fromCharCode(d);
		});
	},

	textToHtml: function(str) {
		if(str)	return str.replace('<', '&lt;').replace('>', '&gt;'); // prevent script injection

		// TODO: linkification, emoticons, markdown?
	},

	linkify: function(str) {
		var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
		var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		var emailAddressPattern = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;

		return str
		.replace(urlPattern, '<a href="$&">$&</a>')
		.replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
		.replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
	},

	sanitize: function(str) {
		str = str.trim().replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
		if(str.length < 3) str = str + Array(4-str.length).join("-");
		str = str.substring(0, 32);
		return str;
	}
};
