/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store),
		  format = require("../lib/format.js");

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
			core.emit("notification-up", {
				id: this.notification.id,
				status: "dismissed"
			});
		}

		get title() {
			let action = this.notification.action,
				title;

			switch (this.notification.subtype) {
			case "mention":
				title = `New mention in ${action.to}`;
				break;
			case "text":
				let thread;

				if (action.thread) {
					thread = store.get("indexes", "threadsById", action.thread);
				}

				title = `New ${thread ? "reply" : "message"} in ${thread && thread.title ? thread.title : action.to}`;
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
				let thread;

				if (action.thread) {
					thread = store.get("indexes", "threadsById", action.thread);
				}

				html = `<strong>${user.getNick(action.from)}</strong> ${thread ? "replied" : "said"} <strong>${this._format(action.text)}</strong> in <strong>${this._format(thread && thread.title ? thread.title : action.to)}</strong>`;
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
};
