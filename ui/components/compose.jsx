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
				nick, user, mention, atStart;

			if (textObj) {
				nick = appUtils.formatUserName(textObj.from);
				user = appUtils.formatUserName(store.get("user"));

				atStart = (/^@\S+[\s+{1}]?/.test(msg));

				msg = msg.replace(/(^@\S+[\s+{1}]?)|(@\S+[\s+{1}]?$)/, "").trim();

				mention = "@" + nick;

				if (msg.indexOf(mention) === -1 && user !== nick) {
					if (atStart) {
						msg = mention + (msg ? " " + msg : "");
					} else {
						msg = (msg ? msg + " " : "") + mention;
					}
				}

				msg = msg ? msg + "&nbsp;" : "";
			}

			return msg;
		},

		onUpdate: function(e) {
			var html = React.findDOMNode(this.refs.composeBox).innerHTML,
				newHtml;

			newHtml = (e && e.type === "statechange") ? this.getMessageText(html) : html;

			if (newHtml.trim() !== html.trim() || newHtml.trim() !== this.state.userInput.trim()) {
				this.setState({ userInput: newHtml });

				core.emit("setstate", {
					nav: { currentText: null }
				});
			}
		},

		onPaste: function() {
			setTimeout(function() {
				var text = React.findDOMNode(this.refs.composeBox).innerHTML;

				// Strip formatting
				this.setState({ userInput: format.textToHtml(format.htmlToText(text)) });
			}.bind(this), 10);
		},

		onKeyDown: function(e) {
			if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
				e.preventDefault();

				this.sendMessage();
			}
		},

		onStateChange: function(changes, next) {
			if (changes.user || (changes.nav && changes.nav.currentText)) {
				this.onUpdate({ type: "statechange" });
			}

			next();
		},

		componentDidMount: function() {
			this.focusInput();

			core.on("statechange", this.onStateChange, 100);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		},

		componentDidUpdate: function() {
			this.focusInput();
		},

		shouldComponentUpdate: function(nextProps, nextState) {
			return this.state.userInput !== nextState.userInput;
		},

		render: function() {
			return (
				<div key="chat-area-input" className="chat-area-input">
					<div className="chat-area-input-inner">
						<div contentEditable autoFocus dangerouslySetInnerHTML={{__html: this.state.userInput}}
							 onPaste={this.onPaste} onKeyDown={this.onKeyDown} onKeyUp={this.onUpdate}
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
