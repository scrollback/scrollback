/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var React = require("react"),
		browserSupports = require("../../lib/browser-supports.js"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		ChatMessageList,
		chatmessagelistEl = document.getElementById("js-chat-area-messages");

	// Enhance chat area layout in modern browsers
	if (browserSupports.CSS("display", "flex")) {
		$("#js-chat-area").addClass("chat-area-enhanced");
	}

	ChatMessageList = React.createClass({
		render: function() {
			var chatitems = [];

			this.props.messages.forEach(function(text) {
				if (typeof text === "object") {
					chatitems.push(<ChatItem text={text} key={"chat-message-list-" + text.id} />);
				}
			});


			return (
				<div className="chat-area-messages-list">
					{chatitems}
				</div>
			);
		}
	});

	core.on("statechange", function(changes, next) {
		var messages, nav = store.getNav();

		if (("texts" in changes || (changes.nav && (changes.nav.room || changes.nav.thread || changes.nav.mode))) && nav.mode === "chat") {
			messages = store.getTexts(nav.room, nav.thread, null, 100) || [];

			React.render(<ChatMessageList messages={messages} />, chatmessagelistEl);
		}

		next();
	}, 500);

	return ChatMessageList;
};
