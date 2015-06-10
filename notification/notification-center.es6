/* eslint-env es6, browser */

"use strict";

module.exports = (core, ...args) => {
	const NotificationItem = require("./notification-item.es6")(core, ...args);

	class NotificationCenter {
		constructor() {
			this._items = [];
		}

		_render(notification) {
			let not = new NotificationItem(notification),
				content, close, actions, item;

			content = document.createElement("span");

			content.innerHTML = not.html;
			content.className = "notification-center-item-content content";

			content.addEventListener("click", () => not.act(), false);

			close = document.createElement("span");

			close.className = "notification-center-item-close close";

			close.addEventListener("click", e => {
				let parent = e.target.parentNode;

				parent.className += " out";

				setTimeout(() => parent.parentNode.removeChild(parent), 300);

				not.dismiss();
			}, false);

			actions = document.createElement("span");

			actions.className = "notification-center-item-actions";

			let handlers = not.handlers;

			for (let handler of handlers) {
				if (handler.label === "default") {
					continue;
				}

				if (typeof handler.action === "function") {
					let button = document.createElement("a");

					button.textContent = handler.label;

					actions.appendChild(button);
				}
			}

			item = document.createElement("div");

			item.className = "notification-center-item item";

			item.appendChild(close);
			item.appendChild(content);
			item.appendChild(actions);

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

			div.className = "notification-center menu-notifications";

			return div;
		}
	}

	return NotificationCenter;
};
