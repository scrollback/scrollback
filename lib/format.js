"use strict";

var MarkdownIt = require("markdown-it"),
	emoji = require("markdown-it-emoji/light.js"),
	twemoji = require("twemoji"),
	md;

md = new MarkdownIt({
	linkify: true
});

md.use(emoji); // use the emoji plugin for remarkable.

module.exports = {
	mdToHtml: function(text) {
		var html;

		try {
			html = twemoji.parse(md.render(text));
		} catch (e) {
			html = this.linkify(this.textToHtml(text || ""));
		}

		return (html || "").replace("<a href=", "<a rel='nofollow' target='_blank' href=");
	},

	mdToText: function(text) {
		if (typeof text !== "string") {
			return "";
		}

		return text.trim()
					.replace(/\!\[([^\]]*)\]\([^\)]*\)/g, function(m, alt) {
						return "[" + (alt || "image") + "]";
					})
					.replace(/\[(.*)\]\([^\)]*\)/g, function(m, txt) {
						return txt;
					})
					.replace(/(?:\r\n|\r|\n)/g, " ")
					.replace(/\s+/g, " ");
	},

	htmlToText: function(html) {
		if (html && typeof html === "string") {
			return html.replace(/<[^>]*>/g, function(m) {
				return (
					/^<br/.test(m) || /^<p/.test(m) || /^<div/.test(m) ||
					/^<\/p/.test(m) || /^<\/div/.test(m)
				) ? "\n" : " ";
			})
			.replace(/\ +/, " ")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			.replace(/&quot;/g, '"')
			.replace(/&nbsp;/g, " ")
			.replace(/&#(\d+);/g, function(m, d) {
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
			return null;
		}

		function addLink(match, protocol, user, domain, port, path) {
			var url = encodeURI(
						(protocol || (user ? "mailto:" : "http://")) +
						(user || "") +
						(domain || "") +
						(port ? ":" + port : "") +
						(path || "")
					);

			return "<a href='" + url + "'>" + match + "</a>";
		}

		return text.replace(/\b(https?\:\/\/)?([\w.\-]*@)?((?:[a-z0-9\-]+)(?:\.[a-z0-9\-]+)*(?:\.[a-z]{2,4}))(:[0-9]{1,4})?((?:\/|\?)\S*)?\b/gi, addLink);
	}
};
