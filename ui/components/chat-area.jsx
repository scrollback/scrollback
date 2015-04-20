/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatAreaMessages = require("./chat-area-messages.jsx")(core, config, store),
		ScrollTo = require("./scroll-to.jsx")(core, config, store),
		Compose = require("./compose.jsx")(core, config, store),
		ChatArea;

	ChatArea = React.createClass({
		scrollToBottom: function() {
			core.emit("setstate", {
				nav: {
					textRange: { time: null }
				}
			});
		},

		render: function() {
			var chatAreaClassNames = "main-content-chat chat-area";

			// Enhance chat area layout in modern browsers
			if (window.CSS.supports("display", "flex")) {
				chatAreaClassNames += " chat-area-enhanced";
			}

			return (
					<div className={chatAreaClassNames} data-mode="chat">

						<ChatAreaMessages />

						<div className="chat-area-actions">
							<ScrollTo type="bottom" onClick={this.scrollToBottom} />

							<Compose />
						</div>
					</div>
			);
		}
	});

	return ChatArea;
};
