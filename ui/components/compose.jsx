/* eslint-env es6, browser */
/* global $ */

"use strict";

const appUtils = require("../../lib/app-utils.js"),
	  gen = require("../../lib/generate.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		TextArea = require("./textarea.jsx")(core, config, store),
		Suggestions = require("./suggestions.jsx")(core, config, store),
		FileUpload = require("./file-upload.jsx")(core, config, store),
		Loader = require("./loader.jsx")(core, config, store),
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

		setEmpty: function() {
			let el = React.findDOMNode(this),
				value = this.refs.composeBox.val();

			if (value) {
				el.classList.remove("empty");
			} else {
				el.classList.add("empty");
			}
		},

		onInput: function() {
			this.setEmpty();

			let value = this.refs.composeBox.val();

			if (value) {
				let area = this.refs.composeBox.area();

				if (area.selectionStart) {
					let typed = value.slice(0, area.selectionStart);

					// If @ pressed
					if (/(^@|\s+@)[a-z0-9\-]*$/.test(typed)) {
						let query = typed.match(/@[a-z0-9\-]*$/)[0].substr(1);

						this.setState({ query });

						return;
					}
				}
			}

			if (this.state.query !== null) {
				this.setState({ query: null });
			}
		},

		onKeyDown: function(e) {
			if (this.state.query === null && e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
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

		onDismissSuggestions: function() {
			this.setState({ query: null });
		},

		onSelectSuggestions: function(user) {
			let composeBox = this.refs.composeBox,
				value = composeBox.val();

			if (value) {
				let selectionStart = this.refs.composeBox.area().selectionStart;

				composeBox.val(value.slice(0, selectionStart).replace(/(@[a-z0-9\-]*)$/, "") + "@" + user.id + " " + value.slice(selectionStart));
			}

			this.setState({ query: null });
		},

		onUploadStart: function() {
			this.setState({ uploadStatus: "active" });
		},

		onUploadError: function(err) {
			let button = React.findDOMNode(this.refs.filebutton),
				popover = document.createElement("div"),
				message = document.createElement("div");

			message.textContent = err;

			message.classList.add("popover-content");
			popover.classList.add("error");

			popover.appendChild(message);

			$(popover).popover({ origin: button });

			$(document).on("popoverDismissed.fileerr", () => {
				this.setState({ uploadStatus: "" });

				$(document).off("popoverDismissed.fileerr");
			});

			this.setState({ uploadStatus: "error" });
		},

		onUploadFinish: function(payload, upload) {
			this.setState({ uploadStatus: "complete" });

			core.emit("text-up", {
				thread: store.get("nav", "thread"),
				tags: [ "image" ],
				to: store.get("nav", "room"),
				id: payload.textId,
				from: payload.userId,
				text: "[![" + upload.file.name + "](" + upload.thumb + ")](" + upload.url + ")"
			});

			setTimeout(() => this.setState({ uploadStatus: "" }), 3000);
		},

		getUploadPayload: function() {
			return {
				uploadType: "content",
				generateThumb: true,
				userId: store.get("user"),
				textId: gen.uid()
			};
		},

		isFileUploadAvailable: function() {
			if (window.Android) {
				return (typeof window.Android.isFileUploadAvailable === "function" && window.Android.isFileUploadAvailable());
			} else {
				return true;
			}
		},

		render: function() {
			return (
				<div key="chat-area-input" className="chat-area-input" data-mode="chat">
					{typeof this.state.query === "string" ?
						<Suggestions query={this.state.query} onDismiss={this.onDismissSuggestions} onSelect={this.onSelectSuggestions} /> :
						null}
					<div className="chat-area-input-inner">
						<TextArea autoFocus={this.state.autofocus} placeholder={this.state.placeholder} disabled={this.state.disabled}
								  onKeyDown={this.onKeyDown} onFocus={this.onFocus} onBlur={this.onBlur} onInput={this.onInput}
								  ref="composeBox" tabIndex="1" className="chat-area-input-entry" />

						<div className="chat-area-input-actions">
							{
								this.isFileUploadAvailable() ?
								<FileUpload
									ref="filebutton"
									className="chat-area-input-action chat-area-input-image"
									data-role="registered follower owner moderator"
									accept="image/*" maxsize="5242880"
									onstart={this.onUploadStart} onerror={this.onUploadError} onfinish={this.onUploadFinish}
									getPayload={this.getUploadPayload}>

									<Loader status={this.state.uploadStatus} />

								</FileUpload>
								: null
							}
							<div className="chat-area-input-action chat-area-input-send" onClick={this.sendMessage}></div>
						</div>
					</div>
				</div>
			);
		},

		getDisabledStatus: function(connection) {
			if (connection === "online") {
				return false;
			} else {
				return true;
			}
		},

		getPlaceholder: function(connection) {
			if (connection === "connecting") {
				return "Connecting...";
			} else if (connection === "online") {
				return "Reply as " + appUtils.formatUserName(store.get("user")) + ", markdown supported";
			} else {
				return "You are offline";
			}
		},

		getInitialState: function() {
			let connection = store.get("app", "connectionStatus");

			return {
				placeholder: this.getPlaceholder(connection),
				disabled: this.getDisabledStatus(connection),
				autofocus: document.hasFocus(),
				uploadStatus: this.state && this.state.uploadStatus ? this.state.uploadStatus : "",
				query: null
			};
		},

		onStateChange: function(changes) {
			if (!this.isMounted()) {
				return;
			}

			if ((changes.app && (changes.app.connectionStatus || "currentText" in changes.app)) || changes.user) {
				let composeBox = this.refs.composeBox,
					text, newText;

				text = composeBox.val();

				newText = this.getMessageText(text);

				composeBox.val((newText.trim() !== text.trim()) ? newText : text);

				let state = this.getInitialState();

				state.uploadStatus = this.state && this.state.uploadStatus ? this.state.uploadStatus : "";

				this.replaceState(state);
			}
		},

		componentDidUpdate: function() {
			if (document.hasFocus()) {
				this.refs.composeBox.focus();
			}

			this.setEmpty();
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
