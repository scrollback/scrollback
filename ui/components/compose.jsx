/* eslint-env es6, browser */
/* global $ */

"use strict";

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		TextArea = require("./textarea.jsx")(core, config, store),
		Compose;

	Compose = React.createClass({
		getMessageText: function(msg) {
			var currentText = store.get("app", "currentText"),
				textObj = store.get("indexes", "textsById", currentText),
				nick, user, mention;

			msg = msg || "";

			if (textObj) {
				nick = appUtils.formatUserName(textObj.from);
				user = appUtils.formatUserName(store.get("user"));

				mention = "@" + nick;

				if (msg.indexOf(mention) === -1 && nick !== user) {
					msg = msg.replace(/(?:^@[a-z0-9\-]+\s?)|(?:\s*(?:\s@[a-z0-9\-]+)?\s*$)/, function(match, index) {
						if (index === 0) {
							return mention;
						} else {
							return " " + mention;
						}
					});
				}

				msg += " ";
			} else {
				msg = msg.replace(/(^@[a-z0-9\-]+\s?)|(@[a-z0-9\-]+\s?$)/, "").trim();
			}

			return msg;
		},

		sendMessage: function() {
			var composeBox = this.refs.composeBox,
				nav = store.get("nav"),
				text = composeBox.val();

			if (!text) {
				return;
			}

			core.emit("text-up", {
				to: nav.room,
				from: store.get("user"),
				text: text,
				thread: nav.thread
			});

			core.emit("setstate", {
				app: { currentText: null }
			});

			composeBox.val("");
		},

		showChooser: function() {
			React.findDOMNode(this.refs.filechooser).click();
		},

		showFileError: function(text) {
			let button = React.findDOMNode(this.refs.filebutton),
				popover = document.createElement("div"),
				message = document.createElement("div");

			message.textContent = text;

			message.classList.add("popover-content");
			popover.classList.add("error");

			popover.appendChild(message);

			$(popover).popover({ origin: button });

			$(document).on("popoverDismissed.fileerr", () => {
				button.classList.remove("progress");
				button.classList.remove("error");

				$(document).off("popoverDismissed.fileerr");
			});
		},

		uploadFiles: function(e) {
			let formData = new FormData(),
				button = React.findDOMNode(this.refs.filebutton),
				files = e.target.files;

			if (files && files.length) {
				for (let i = 0, l = files.length; i < l; i++) {
					let file = files[i];

					if (file.size > 5242880) {
						let size = Math.round(file.size * 100 / 1048576) / 100;

						this.showFileError("File is too big (" + size + "MB). Only files upto 5MB are allowed.");

						return;
					}

					formData.append("photos[]", file, file.name);
				}
			}

			button.classList.add("progress");

			let xhr = new XMLHttpRequest();

			xhr.open("POST", "/upload", true);

			let circle = React.findDOMNode(this.refs.progresscircle);

			xhr.addEventListener("progress", event => {
				if (event.lengthComputable) {
					circle.setAttribute("stroke-dashoffset", 100 - (event.loaded / event.total));
				}
			}, false);

			xhr.addEventListener("load", () => {
				button.classList.add("complete");

				circle.setAttribute("stroke-dashoffset", 0);

				setTimeout(() => {
					button.classList.remove("progress");
					button.classList.remove("complete");
				}, 3000);
			}, false);

			xhr.addEventListener("error", () => {
				button.classList.add("error");

				this.showFileError("Upload failed!");
			}, false);

			xhr.addEventListener("abort", () => {
				button.classList.add("error");

				this.showFileError("Upload aborted!");
			}, false);

			xhr.send();

			// Hacky way to clear file input
			try {
				e.target.value = "";

				if (e.target.value) {
					e.target.type = "text";
					e.target.type = "file";
				}
			} catch (err) {
				console.log("Error clearing file input", err);
			}
		},

		setEmpty: function() {
			let el = React.findDOMNode(this),
				composeBox = this.refs.composeBox;

			if (composeBox.val()) {
				el.classList.remove("empty");
			} else {
				el.classList.add("empty");
			}
		},

		onKeyDown: function(e) {
			if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
				e.preventDefault();

				this.sendMessage();
			}
		},

		onBlur: function() {
			if (store.get("app", "focusedInput") === "compose") {
				core.emit("setstate", {
					app: { focusedInput: null }
				});
			}
		},

		onFocus: function() {
			core.emit("setstate", {
				app: { focusedInput: "compose" }
			});
		},

		componentDidUpdate: function() {
			var composeBox = this.refs.composeBox,
				text, newText;

			text = composeBox.val();

			newText = this.getMessageText(text);

			if (newText.trim() !== text.trim()) {
				composeBox.val(newText);
			}

			if (document.hasFocus()) {
				composeBox.focus();
			}

			this.setEmpty();
		},

		render: function() {
			return (
				<div key="chat-area-input" className="chat-area-input" data-mode="chat">
					<div className="chat-area-input-inner">
						<TextArea autoFocus={this.state.autofocus} placeholder={this.state.placeholder} disabled={this.state.disabled}
								  onKeyDown={this.onKeyDown} onFocus={this.onFocus} onBlur={this.onBlur} onInput={this.setEmpty}
								  ref="composeBox" tabIndex="1" className="chat-area-input-entry" />
						<div className="chat-area-input-actions">
							<div ref="filebutton" className="chat-area-input-action chat-area-input-image" onClick={this.showChooser}>
								<input ref="filechooser" type="file" onChange={this.uploadFiles} multiple={true} accept="image/*" />
								<svg className="progress-indicator" width="35" height="35">
								    <circle ref="progresscircle" cx="18" cy="18" r="16" fill="none" strokeWidth="2" />
								    <path className="check" d="M6,11.2 L1.8,7 L0.4,8.4 L6,14 L18,2 L16.6,0.6 L6,11.2 Z" transform="translate(27, 25) rotate(180)"/>
								    <path className="warn" d="M0,19 L22,19 L11,0 L0,19 L0,19 Z M12,16 L10,16 L10,14 L12,14 L12,16 L12,16 Z M12,12 L10,12 L10,8 L12,8 L12,12 L12,12 Z" transform="translate(29, 28) rotate(180)" />
								</svg>
							</div>
							<div className="chat-area-input-action chat-area-input-send" onClick={this.sendMessage}></div>
						</div>
					</div>
				</div>
			);
		},

		getInitialState: function() {
			return {
				placeholder: "",
				autofocus: false,
				disabled: true
			};
		},

		onStateChange: function(changes) {
			var connection, placeholder, disabled;

			if (!this.isMounted()) {
				return;
			}

			if ((changes.nav && changes.nav.mode) ||
				(changes.app && (changes.app.connectionStatus || "currentText" in changes.app)) || changes.user) {
				connection = store.get("app", "connectionStatus");
				if (connection === "connecting") {
					placeholder = "Connecting...";
					disabled = true;
				} else if (connection === "online") {
					placeholder = "Reply as " + appUtils.formatUserName(store.get("user")) + ", markdown supported";
					disabled = false;
				} else {
					placeholder = "You are offline";
					disabled = true;
				}

				this.setState({
					placeholder: placeholder,
					autofocus: document.hasFocus(),
					disabled: disabled
				});
			}
		},
		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 400);

			this.setEmpty();
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return Compose;
};
