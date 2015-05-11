/* eslint-env es6, browser */

"use strict";

module.exports = (core, ...args) => {
	const user = require("../../lib/user.js")(core, ...args),
		  format = require("../../lib/format.js");

	class NotificationCenter {
		constructor() {
			this._items = [];
		}

		_format(text) {
			text = typeof text === "string" ? text : "";

			text = text.length > 42 ? (text.slice(0, 42) + "…") : text;

			return format.textToHtml(text);
		}

		_render(notification) {
			let action = notification.action,
				type = notification.subtype,
				html, listener;

			switch (type) {
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

			switch (type) {
			case "mention":
			case "text":
				listener = () => {
					core.emit("setstate", {
						nav: {
							room: action.to,
							thread: action.thread,
							mode: action.thread ? "chat" : "room"
						}
					});
				}
				break;
			default:
				listener = () => core.emit("setstate", { nav: { room: action.to }});
			}

			let content = document.createElement("span");

			content.innerHTML = html;
			content.className = "notification-center-item-content content";

			let close = document.createElement("span");

			close.className = "notification-center-item-close close";

			let item = document.createElement("a");

			item.className = "notification-center-item item";
			item.appendChild(content);
			item.appendChild(close);
			item.addEventListener("click", e => {
				let className = e.target.className;

				if (/content/.test(className)) {
					listener();
				}

				if (/close/.test(className)) {
					let parent = e.target.parentNode;

					parent.className += " out";

					setTimeout(() => parent.parentNode.removeChild(parent), 300);
				}
			}, false);

			return item;
		}

		add(notification) {
			this._items.push(notification);
		}

		get dom() {
			let div = document.createElement("div");

			for (let item of this._items) {
				div.appendChild(this._render(item));
			}

			div.className = "notification-center";

			return div;
		}
	}

	return NotificationCenter;
}
