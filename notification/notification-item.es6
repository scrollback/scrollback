/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const user = require("../lib/user.js")(core, config, store),
		  format = require("../lib/format.js"),
		  max = 3;

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
				noteType: this.note.noteType,
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
			let data = this.note.noteData,
				count = this.note.count,
				title;

			switch (this.note.noteType) {
			case "mention":
				if (count > max) {
					title = `${count} new mentions`;
				} else {
					title = `New mention`;
				}

				title += ` in ${this._getroom()}`;

				break;
			case "reply":
				if (count > max) {
					title = `${count} new ${data.title ? "replies" : "messages"}`;
				} else {
					title = `New ${data.title ? "reply" : "message"}`;
				}

				title += ` in ${data.title || this._getroom()}`;

				break;
			case "thread":
				if (count > max) {
					title = `${count} new discussions`;
				} else {
					title = `New discussion`;
				}

				title += ` in ${this._getroom()}`;

				break;
			default:
				if (count > max) {
					title = `${count} new notifications`;
				} else {
					title = `New notification`;
				}

				title += ` in ${data.title || this._getroom()}`;
			}

			return title;
		}

		get summary() {
			let data = this.note.noteData,
				summary;

			switch (this.note.noteType) {
			case "thread":
				summary = `${user.getNick(data.from)} : ${this._format(data.title)}`;
				break;
			default:
				summary = `${user.getNick(data.from)} : ${this._format(data.text)}`;
			}

			return summary;
		}

		get html() {
			let data = this.note.noteData,
				count = this.note.count,
				html;

			switch (this.note.noteType) {
			case "mention":
				if (count > max) {
					html = `<strong>${count}</strong> new mentions`;
				} else {
					html = `<strong>${user.getNick(data.from)}</strong> mentioned you`;
				}

				html += ` in <strong>${this._format(data.title || this._getroom())}</strong>: <strong>${this._format(data.text)}</strong>`;

				break;
			case "reply":
				if (count > max) {
					html = `<strong>${count}</strong> new ${data.title ? "replies" : "messages"}`;
				} else {
					html = `<strong>${user.getNick(data.from)}</strong> ${data.title ? "replied" : "said"} <strong>${this._format(data.text)}</strong>`;
				}

				html += ` in <strong>${this._format(data.title || this._getroom())}</strong>`;

				break;
			case "thread":
				if (count > max) {
					html = `<strong>${count}</strong> new discussions`;
				} else {
					html = `<strong>${user.getNick(data.from)}</strong> started a discussion on <strong>${this._format(data.title)}</strong>`;
				}

				html += ` in <strong>${this._format(this._getroom())}</strong>`;

				break;
			default:
				if (count > max) {
					html = `${count} new notifications`;
				} else {
					html = `New notification`;
				}

				html += ` in <strong>${this._format(data.title || this._getroom())}</strong>`;
			}

			return html;
		}

		get handlers() {
			let handlers = [];

			switch (this.note.noteType) {
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
								thread: this.note.ref,
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
