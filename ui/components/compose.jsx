/* jshint browser: true */

var appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		TextArea = require("./textarea.js")(core, config, store),
		Compose;

	Compose = React.createClass({
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

				msg = msg ? msg + " " : "";
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

				core.emit("setstate", {
					nav: { currentText: null }
				});
			}

			composeBox.focus();
		},

		render: function() {
			return (
				<div key="chat-area-input" className="chat-area-input">
					<div className="chat-area-input-inner">
						<TextArea placeholder={"Reply as " + appUtils.formatUserName(store.get("user"))}
								  onKeyDown={this.onKeyDown} onInput={this.onInput}
								  ref="composeBox" className="chat-area-input-entry" tabIndex="1" autoFocus />
						<div className="chat-area-input-send" onClick={this.sendMessage}></div>
					</div>
				</div>
			);
		}
	});

	return Compose;
};
