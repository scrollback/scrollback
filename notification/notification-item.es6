/* eslint-env es6, browser */

"use strict";

module.exports = (core, ...args) => {
	const user = require("../lib/user.js")(core, ...args),
		  format = require("../lib/format.js"),
		  objUtils = require("../lib/obj-utils.js");

	class NotificationItem {
		constructor(notification) {
			this.notification = notification;
		}

		_format(text) {
			text = typeof text === "string" ? text : "";

			text = text.length > 42 ? (text.slice(0, 42) + "…") : text;

			return format.textToHtml(text);
		}

		dismiss() {
			let not = objUtils.clone(this.notification);

			not.status = "dismissed";

			core.emit("notification-up", not);
		}

		get title() {
			let action = this.notification.action,
				title;

			switch (this.notification.subtype) {
			case "mention":
				title = `New mention in ${action.to}`;
				break;
			case "text":
				title = `New ${action.thread ? "reply" : "message"} in ${action.to}`;
				break;
			case "thread":
				title = `New discussion in ${action.to}`;
				break;
			default:
				title = `New notification in ${action.to}`;
			}

			return title;
		}

		get summary() {
			let action = this.notification.action,
				summary;

			switch (this.notification.subtype) {
			case "thread":
				summary = `${user.getNick(action.from)} : ${this._format(action.title)}`;
				break;
			default:
				summary = `${user.getNick(action.from)} : ${this._format(action.text)}`;
			}

			return summary;
		}

		get html() {
			let action = this.notification.action,
				html;

			switch (this.notification.subtype) {
			case "mention":
				html = `<strong>${user.getNick(action.from)}</strong> mentioned you in <strong>${action.to}</strong>: <strong>${this._format(action.text)}</strong>`;
				break;
			case "text":
				html = `<strong>${user.getNick(action.from)}</strong> ${action.title ? "replied" : "said"} <strong>${this._format(action.text)}</strong> in <strong>${this._format(action.title || action.to)}</strong>`;
				break;
			case "thread":
				html = `<strong>${user.getNick(action.from)}</strong> started a discussion on <strong>${this._format(action.title)}</strong> in <strong>${action.to}</strong>`;
				break;
			default:
				html = `New notification in <strong>${action.to}</strong>`;
			}

			return html;
		}

		get handlers() {
			let action = this.notification.action,
				handlers = [];

			switch (this.notification.subtype) {
			case "mention":
			case "text":
				handlers.push(() => {
					core.emit("setstate", {
						nav: {
							room: action.to,
							thread: action.thread,
							mode: "chat",
							textRange: { time: action.time }
						}
					});
				});

				break;
			case "thread":
				handlers.push(() => {
					core.emit("setstate", {
						nav: {
							room: action.to,
							thread: action.id,
							mode: "chat",
							threadRange: { time: action.time }
						}
					});
				});

				break;
			default:
				handlers.push(() => {
					core.emit("setstate", {
						nav: {
							room: action.to,
							mode: "room"
						}
					});
				});
			}

			return handlers;
		}
	}

	return NotificationItem;
}
