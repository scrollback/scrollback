/* jshint browser: true */

var format = require("../../lib/format.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		Compose;

	Compose = React.createClass({
		getInitialState: function() {
			return { userInput: "" };
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

			composePlaceholder.innerText = composePlaceholder.textContent = text ? "" : "Reply as " + format.username(store.get("user"));
		},

		onPaste: function() {
			setTimeout(function() {
				var text = format.htmlToText(this.refs.composeBox.getDOMNode().innerHTML);

				this.setState({ userInput: format.textToHtml(text) });
			}.bind(this), 10);
		},

		onBlur: function(e) {
			this.setState({ userInput: e.target.innerHTML });
		},

		onKeyDown: function(e) {
			if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
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
			var currentText = store.get("nav", "currentText"),
				textObj = store.get("indexes", "textsById", currentText),
				msg = this.state.userInput || "",
				user, nick, atStart;

			if (textObj) {
				nick = textObj.from;
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

				msg = format.textToHtml(msg).trim();
				msg = msg ? msg + "&nbsp;" : "";
			}

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
