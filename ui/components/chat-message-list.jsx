/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	var React = require("react"),
		browserSupports = require("../../lib/browser-supports.js"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		ChatMessageList;

	// Enhance chat area layout in modern browsers
	if (browserSupports.CSS("display", "flex")) {
		$("#js-chat-area").addClass("chat-area-enhanced");
	}

	ChatMessageList = React.createClass({
		render: function() {
			var chatitems = [],
				nav = store.getNav();

			(store.getTexts(nav.room, nav.thread, null, 100) || []).forEach(function(text) {
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

	return ChatMessageList;
};
