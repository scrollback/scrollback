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

		_extract(index) {
			return typeof this.note.group === "string" ? this.note.group.split("/")[index] : null;
		}

		get _thread() {
			let thread = this._extract(1);

			return (thread === "all" || !thread) ? null : thread;
		}

		get _room() {
			return this._extract(0);
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

				title += ` in ${this._room}`;

				break;
			case "reply":
				if (count > max) {
					title = `${count} new ${data.title ? "replies" : "messages"}`;
				} else {
					title = `New ${data.title ? "reply" : "message"}`;
				}

				title += ` in ${data.title || this._room}`;

				break;
			case "thread":
				if (count > max) {
					title = `${count} new discussions`;
				} else {
					title = `New discussion`;
				}

				title += ` in ${this._room}`;

				break;
			default:
				if (count > max) {
					title = `${count} new notifications`;
				} else {
					title = `New notification`;
				}

				title += ` in ${data.title || this._room}`;
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

				if (data.title) {
					html += ` in <strong>${this._format(data.title)}</strong>`;
				}

				html += ` : <strong>${this._format(data.text)}</strong> - <strong>${this._format(this._room)}</strong>`;

				break;
			case "reply":
				if (count > max) {
					html = `<strong>${count}</strong> new ${data.title ? "replies" : "messages"}`;
				} else {
					html = `<strong>${user.getNick(data.from)}</strong> ${data.title ? "replied" : "said"} <strong>${this._format(data.text)}</strong>`;
				}

				if (data.title) {
					html += ` in <strong>${this._format(data.title)}</strong>`;
				}

				html += ` - <strong>${this._format(this._room)}</strong>`;

				break;
			case "thread":
				if (count > max) {
					html = `<strong>${count}</strong> new discussions`;
				} else {
					html = `<strong>${user.getNick(data.from)}</strong> started a discussion on <strong>${this._format(data.title)}</strong>`;
				}

				html += ` - <strong>${this._format(this._room)}</strong>`;

				break;
			default:
				if (count > max) {
					html = `${count} new notifications`;
				} else {
					html = `New notification`;
				}

				html += ` - <strong>${this._format(this._room)}</strong>`;
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
								room: this._room,
								thread: this._thread,
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
								room: this._room,
								thread: this.note.count > 1 ? null : this.note.ref,
								mode: this.note.count > 1 ? "room" : "chat",
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
								room: this._room,
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
