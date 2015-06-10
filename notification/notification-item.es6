/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store),
		  format = require("../lib/format.js");

	class NotificationItem {
		constructor(note) {
			this.note = note;
		}

		_truncate(text, count = 42) {
			text = typeof text === "string" ? text.trim() : "";

			return (text.length > count ? (text.slice(0, count) + "…") : text);
		}

		_format(text) {
			return this._truncate(format.mdToText(text));
		}

		_getcomponent(index) {
			return typeof this.note.group === "string" ? this.note.group.split("/")[index] : null;
		}

		_getthread() {
			return this._getcomponent(1) || "";
		}

		_getroom() {
			return this._getcomponent(0) || "";
		}

		dismiss() {
			core.emit("note-up", {
				ref: this.note.ref,
				dismissTime: Date.now()
			});
		}

		act() {
			let handlers = this.handlers;

			for (let handler of handlers) {
				if (handler.label === "default" && typeof handler.action === "function") {
					handler.action();

					break;
				}
			}

			this.dismiss();
		}

		get title() {
			let data = this.note.notedata,
				title;

			switch (this.note.notetype) {
			case "mention":
				title = `New mention in ${this._getroom()}`;
				break;
			case "reply":
				title = `New ${data.title ? "reply" : "message"} in ${data.title || this._getroom()}`;
				break;
			case "thread":
				title = `New discussion in ${this._getroom()}`;
				break;
			default:
				title = `New notification in ${data.title || this._getroom()}`;
			}

			return title;
		}

		get summary() {
			let data = this.note.notedata,
				summary;

			switch (this.note.notetype) {
			case "thread":
				summary = `${user.getNick(data.from)} : ${this._format(data.title)}`;
				break;
			default:
				summary = `${user.getNick(data.from)} : ${this._format(data.text)}`;
			}

			return summary;
		}

		get html() {
			let data = this.note.notedata,
				html;

			switch (this.note.notetype) {
			case "mention":
				html = `<strong>${user.getNick(data.from)}</strong> mentioned you in <strong>${data.to}</strong>: <strong>${this._format(data.text)}</strong>`;
				break;
			case "reply":
				html = `<strong>${user.getNick(data.from)}</strong> ${data.title ? "replied" : "said"} <strong>${this._format(data.text)}</strong> in <strong>${this._format(data.title || this._getroom())}</strong>`;
				break;
			case "thread":
				html = `<strong>${user.getNick(data.from)}</strong> started a discussion on <strong>${this._format(data.title)}</strong> in <strong>${this._format(this._getroom())}</strong>`;
				break;
			default:
				html = `New notification in <strong>${this._format(this._getroom())}</strong>`;
			}

			return html;
		}

		get handlers() {
			let handlers = [];

			switch (this.note.notetype) {
			case "mention":
			case "reply":
				handlers.push({
					label: "default",
					action: () => {
						core.emit("setstate", {
							nav: {
								room: this._getroom(),
								thread: this._getthread(),
								mode: "chat",
								textRange: { time: this.note.time }
							}
						});
					}
				});

				break;
			case "thread":
				handlers.push({
					label: "default",
					action: () => {
						core.emit("setstate", {
							nav: {
								room: this._getroom(),
								thread: this._getthread(),
								mode: "chat",
								threadRange: { time: this.note.time }
							}
						});
					}
				});

				break;
			default:
				handlers.push({
					label: "default",
					action: () => {
						core.emit("setstate", {
							nav: {
								room: this._getroom(),
								mode: "room"
							}
						});
					}
				});
			}

			return handlers;
		}
	}

	return NotificationItem;
};
