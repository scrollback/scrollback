/* eslint-env es6, browser */

"use strict";

module.exports = core => {
	class NotificationCenter {
		constructor() {
			this._items = [];
		}

		_render(notification) {
			let action = notification.action,
				type = notification.subtype,
				text, listener;

			switch (type) {
			case "mention":
				text = `${action.from} mentioned you in ${action.to}`;
				break;
			case "text":
				text = `${action.from} said '${action.text}' in ${action.title || action.to}`;
				break;
			case "thread":
				text = `${action.from} started discussion '${action.title}' in ${action.to}`;
				break;
			default:
				text = `New notification in ${action.to}`;
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

			content.textContent = text;
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
