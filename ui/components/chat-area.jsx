/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		browserSupports = require("../../lib/browser-supports.js"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		Compose = require("./compose.jsx")(core, config, store),
		Endless = require("../../bower_components/endless/endless.js"),
		ChatArea;

	ChatArea = React.createClass({
		onScroll: function (key, above, below) {
			var time = parseInt(key.split('-').pop());

			core.emit("setstate", {
				nav: {
					textRange: {
						time: time,
						above: above,
						below: below
					}
				}
			});
		},

		render: function() {
			var chatitems = [], atTop = false, atBottom = true,
				nav = store.getNav(),
				classNames = "main-content-chat chat-area",
				content;

			// Enhance chat area layout in modern browsers
			if (browserSupports.CSS("display", "flex")) {
				classNames += " chat-area-enhanced";
			}

			// TODO: if(textRange.before + 10) getText( - textrange.before).concat() + 10)
			(store.getTexts(nav.room, nav.thread, null, -100) || []).forEach(function(text) {
				if (typeof text === "object") {
					chatitems.push(<ChatItem text={text} key={"chat-message-list-" + nav.room + "-" + nav.thread + "-" + text.id + "-" + text.time} />);
				}
			});

			atTop = !(chatitems.length && chatitems.length >= 100);

			if (chatitems.length) {
				content = (
							<div className="chat-area-messages">
								<div className="chat-area-messages-list">
									<Endless items={chatitems} onScroll={this.onScroll} atTop={atTop} atBottom={atBottom} />
								</div>
							</div>
				);
			} else {
				content = <div className="chat-area-empty">There are no messages yet :-(</div>;
			}

			return (
					<div className={classNames} data-mode="chat">
						{content}

						<Compose />
					</div>
			);
		}
	});

	return ChatArea;
};
