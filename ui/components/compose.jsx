/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		TextArea = require("./textarea.jsx")(core, config, store),
		Compose;

	Compose = React.createClass({
		getMessageText: function(msg) {
			var currentText = store.get("nav", "currentText"),
				textObj = store.get("indexes", "textsById", currentText),
				nick, user, mention;

			msg = msg || "";

			if (textObj) {
				nick = appUtils.formatUserName(textObj.from);
				user = appUtils.formatUserName(store.get("user"));

				mention = "@" + nick;

				if (msg.indexOf(mention) === -1 && nick != user) {
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
				text;

			text = composeBox.val();

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

			core.emit("setstate", {
				nav: { currentText: null }
			});

			composeBox.val("");
		},

		onKeyDown: function(e) {
			if (e.keyCode === 13 && !(e.altKey || e.shiftKey || e.ctrlKey)) {
				e.preventDefault();

				this.sendMessage();
			}
		},

		componentDidUpdate: function() {
			var composeBox = this.refs.composeBox,
				text, newText;

			text = composeBox.val();

			newText = this.getMessageText(text);

			if (newText.trim() !== text.trim()) {
				composeBox.val(newText);
			}

			composeBox.focus();
		},

		render: function() {
			return (
				<div key="chat-area-input" className="chat-area-input">
					<div className="chat-area-input-inner">
						<TextArea placeholder={"Reply as " + appUtils.formatUserName(store.get("user"))}
								  onKeyDown={this.onKeyDown} ref="composeBox"
								  className="chat-area-input-entry" tabIndex="1" autoFocus />
						<div className="chat-area-input-send" onClick={this.sendMessage}></div>
					</div>
				</div>
			);
		}
	});

	return Compose;
};
