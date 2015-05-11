/* eslint-env es6, browser */

"use strict";

module.exports = (core, ...args) => {
	const NotificationItem = require("./notification-item.es6")(core, ...args),
		  objUtils = require("../lib/obj-utils.js");

	class NotificationCenter {
		constructor() {
			this._items = [];
		}

		_dismiss(notification) {
			let not = objUtils.clone(notification);

			not.status = "dismissed";

			core.emit("notification-up", { notification: not });
		}

		_render(notification) {
			let not = new NotificationItem(notification),
				content, close, item;

			content = document.createElement("span");

			content.innerHTML = not.html;
			content.className = "notification-center-item-content content";
			content.addEventListener("click", () => {
				not.handlers[0]();

				this._dismiss(notification);
			}, false);

			close = document.createElement("span");

			close.className = "notification-center-item-close close";
			close.addEventListener("click", e => {
				let parent = e.target.parentNode;

				parent.className += " out";

				setTimeout(() => parent.parentNode.removeChild(parent), 300);

				this._dismiss(notification);
			}, false);

			item = document.createElement("a");

			item.className = "notification-center-item item";
			item.appendChild(content);
			item.appendChild(close);

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
}
