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

		focusInput: function() {
			var composeBox = this.refs.composeBox.getDOMNode(),
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
			var composeBox = this.refs.composeBox.getDOMNode(),
				text = format.htmlToText(composeBox.innerHTML),
				nav = store.get("nav");

			if (!text) {
				return;
			}

			core.emit("text-up", {
				to: nav.room,
				from: store.get("user"),
				text: text,
				time: new Date().getTime(),
				thread: nav.thread
			});

			this.replaceState(this.getInitialState());

			// FIXME: figure out why replaceState is not working
			composeBox.innerText = composeBox.textContent = this.getInitialState().userInput;
		},

		setPlaceHolder: function() {
			var composePlaceholder = this.refs.composePlaceholder.getDOMNode(),
				composeBox = this.refs.composeBox.getDOMNode(),
				text = (composeBox.innerText || composeBox.textContent);

			composePlaceholder.innerText = composePlaceholder.textContent = text ? "" : "Reply as " + appUtils.formatUserName(store.get("user"));
		},

		onPaste: function() {
			setTimeout(function() {
				var text = this.refs.composeBox.getDOMNode().innerHTML;

				this.setState({ userInput: text });
			}.bind(this), 10);
		},

		onBlur: function(e) {
			this.setState({ userInput: e.target.innerHTML });
		},

		onKeyDown: function(e) {
			if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
				e.preventDefault();

				this.sendMessage();
			}
		},

		componentDidMount: function() {
			this.setPlaceHolder();
		},

		componentDidUpdate: function() {
			this.setPlaceHolder();
		},

		render: function() {
			var msg = this.getMessageText(this.state.userInput);

			return (
				<div key="chat-area-input" className="chat-area-input">
					<div className="chat-area-input-inner">
						<div contentEditable autoFocus dangerouslySetInnerHTML={{__html: msg}}
							 onPaste={this.onPaste} onBlur={this.onBlur} onKeyDown={this.onKeyDown} onInput={this.setPlaceHolder}
							 ref="composeBox" tabIndex="1" className="chat-area-input-entry">
						</div>
						<div ref="composePlaceholder" className="chat-area-input-placeholder"></div>
						<div className="chat-area-input-send" onClick={this.sendMessage}></div>
					</div>
				</div>
			);
		}
	});

	return Compose;
};
