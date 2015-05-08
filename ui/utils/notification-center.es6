/* eslint-env es6, browser */

"use strict";

class NotificationCenter {
	constructor() {
		this._items = [];
	}

	render(notification) {
		let action = notification.action,
			type = notification.subtype,
			text, url;

		switch (type) {
		case "mention":
			text = `<strong>${action.from}</strong> mentioned you in <strong>${action.to}</strong>`;
			break;
		case "text":
			text = `New messages in <strong>${action.title || action.to}</strong>`;
			break;
		case "thread":
			text = `New discussions in <strong>${action.to}</strong>`;
			break;
		default:
			text = `New notification in <strong>${action.to}</strong>`;
		}

		switch (type) {
		case "mention":
		case "text":
			url = `/${action.to}/${action.thread || "all"}/${action.time || ""}`;
			break;
		default:
			url = `/${action.to}`;
		}

		return `<a href=${url} class="notification-center-item"><span class="content">${text}</span><span class="close"></span></a>`;
	}

	add(notification) {
		this._items.push(notification);
	}

	get html() {
		let html;

		html = "";

		for (let item of this._items) {
			html += this.render(item);
		}

		return `<div class="notification-center">${html}</div>`;
	}
}

module.exports =  NotificationCenter;
