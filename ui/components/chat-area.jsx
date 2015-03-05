/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		browserSupports = require("../../lib/browser-supports.js"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		Compose = require("./compose.jsx")(core, config, store),
		Endless = require("../../bower_components/endless/endless.js"),
		ChatArea;

	ChatArea = React.createClass({
		onScroll: function (key, before, after) {
			var time;

			if (key === "top") {
				time = 1;
			} else if (key === "bottom") {
				time = null;
			} else {
				time = parseInt(key.split("-").pop());
			}

			core.emit("setstate", {
				nav: {
					textRange: {
						time: time,
						before: before,
						after: after
					}
				}
			});
		},

		render: function() {
			var chatitems = [], atTop = false, atBottom = true,
				nav = store.getNav(),
				classNames = "main-content-chat chat-area",
				content, before, after, beforeItems, afterItems;

			// Don"t show
			if (store.getNav().mode !== "chat") {
				return <div />;
			}

			// Enhance chat area layout in modern browsers
			if (browserSupports.CSS("display", "flex")) {
				classNames += " chat-area-enhanced";
			}

			before = (nav.textRange.before || 0) + 10;
			after = (nav.textRange.after || 0) + 10;

			beforeItems = store.getTexts(nav.room, nav.thread, nav.textRange.time, -before);
			afterItems = store.getTexts(nav.room, nav.thread, nav.textRange.time, after);

			atTop = (beforeItems.length < before && beforeItems[0] !== "missing");
			atBottom = (afterItems.length < after && afterItems[afterItems.length-1] !== "missing");

			if (beforeItems[beforeItems.length-1] === afterItems[0] || (
			   beforeItems[beforeItems.length-1] && afterItems[0] &&
			   beforeItems[beforeItems.length-1].id === afterItems[0].id)) {
				beforeItems.pop();
			}

			(beforeItems.concat(afterItems)).forEach(function(text, i, items) {
				var key;
				if (typeof text === "object") {
					key = "chat-message-list-" + nav.room + "-" + nav.thread + "-" + text.id + "-" + text.time;

					chatitems.push(<ChatItem text={text} key={key} />);
				} else if (text === "missing") {
					key = "chat-message-list-" + nav.room + "-" + nav.thread + "-unknown-" + (items[i+1] || items[i-1] || { time: null }).time;

					chatitems.push(<div className="chat-item chat-item-missing" key={key}><em>Missing</em></div>);
				}
			});

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
