/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		browserSupports = require("../../lib/browser-supports.js"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		Compose = require("./compose.jsx")(core, config, store),
		ChatArea;

	ChatArea = React.createClass({
		render: function() {
			var chatitems = [],
				nav = store.getNav(),
				classNames = "main-content-chat chat-area";

			// Enhance chat area layout in modern browsers
			if (browserSupports.CSS("display", "flex")) {
				classNames += " chat-area-enhanced";
			}

			(store.getTexts(nav.room, nav.thread, null, -100) || []).forEach(function(text) {
				if (typeof text === "object") {
					chatitems.push(<ChatItem text={text} key={"chat-message-list-" + nav.room + "-" + nav.thread + "-" + text.id} />);
				}
			});

			return (
					<div className={classNames} data-mode="chat">
						<div className="chat-area-messages">
							<div className="chat-area-messages-list">{chatitems}</div>
						</div>

						<Compose />
					</div>
			);
		}
	});

	return ChatArea;
};
