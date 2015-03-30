/* jshint browser: true */

var format = require("../../lib/format.js"),
	appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Compose;

	Compose = React.createClass({
		getInitialState: function() {
			return { userInput: "" };
		},

		focusInput: function() {
			var composeBox = React.findDOMNode(this.refs.composeBox),
				range, selection;

			composeBox.focus();

			if (document.createRange) {
				range = document.createRange();
				range.selectNodeContents(composeBox);
				range.collapse(false);
				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			} else if (document.selection) {
				range = document.body.createTextRange();
				range.moveToElementText(composeBox);
				range.collapse(false);
				range.select();
			}
		},

		sendMessage: function() {
			var text = format.htmlToText(this.state.userInput),
				nav = store.get("nav");

			if (!text) {
				return;
			}

			core.emit("text-up", {
				to: nav.room,
				from: store.get("user"),
				text: text,
				time: Date.now(),
				thread: nav.thread
			});

			this.replaceState(this.getInitialState());
		},

		getPlaceHolder: function() {
			return ("Reply as " + appUtils.formatUserName(store.get("user")));
		},

		getMessageText: function(input) {
			var currentText = store.get("nav", "currentText"),
				textObj = store.get("indexes", "textsById", currentText),
				msg = input || "",
				user, nick, atStart;

			if (textObj) {
				nick = appUtils.formatUserName(textObj.from);
				user = store.get("user");

				if (/^@\S+[\s+{1}]?/.test(msg)) {
					msg = msg.replace(/^@\S+[\s+{1}]?/, "");
					atStart = true;
				} else {
					msg = msg.replace(/@\S+[\s+{1}]?$/, "");
				}

				if (msg.indexOf("@" + nick) < 0 && user !== nick) {
					if (atStart) {
						msg = "@" + nick + (msg ? " " + msg : "");
					} else {
						msg = (msg ? msg + " " : "") + "@" + nick;
					}
				}

				msg = msg ? msg + "&nbsp;" : "";
			}

			return msg;
		},

		onChange: function(e) {
			var html = e.target.innerHTML,
				type = e.type,
				newHtml;

			// Add a delay so that state gets updated
			setTimeout(function() {
				newHtml = (type === "blur") ? this.getMessageText(html) : html;

				if (newHtml.trim() !== html.trim() || newHtml.trim() !== this.state.userInput.trim()) {
					this.setState({ userInput: newHtml });
				}
			}.bind(this), (type === "blur") ? 200 : 0);
		},

		onFocus: function() {
			core.emit("setstate", {
				nav: { currentText: null }
			});
		},

		onPaste: function() {
			setTimeout(function() {
				var text = React.findDOMNode(this.refs.composeBox).innerHTML;

				this.setState({ userInput: text });
			}.bind(this), 10);
		},

		onKeyDown: function(e) {
			if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
				e.preventDefault();

				this.sendMessage();
			} else {
				this.onChange(e);
			}
		},

		componentDidMount: function() {
			this.focusInput();
		},

		componentDidUpdate: function() {
			if (store.get("nav", "currentText")) {
				this.focusInput();
			}
		},

		render: function() {
			return (
				<div key="chat-area-input" className="chat-area-input">
					<div className="chat-area-input-inner">
						<div contentEditable autoFocus dangerouslySetInnerHTML={{__html: this.state.userInput}}
							 onPaste={this.onPaste} onKeyDown={this.onKeyDown} onFocus={this.onFocus} onBlur={this.onChange} onInput={this.onChange}
							 ref="composeBox" tabIndex="1" className="chat-area-input-entry">
						</div>
						<div ref="composePlaceholder" className="chat-area-input-placeholder">{this.state.userInput ? "" : this.getPlaceHolder()}</div>
						<div className="chat-area-input-send" onClick={this.sendMessage}></div>
					</div>
				</div>
			);
		}
	});

	return Compose;
};
