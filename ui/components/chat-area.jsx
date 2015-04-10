/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		Compose = require("./compose.jsx")(core, config, store),
		Endless = require("../../bower_components/endless/endless.js"),
		ChatArea;

	ChatArea = React.createClass({
		scrollToBottom: function() {
			core.emit("setstate", {
				nav: {
					textRange: { time: null }
				}
			});
		},

		onScroll: function(key, before, after) {
			var time;

			if (key === "top") {
				time = 1;
			} else if (key === "bottom") {
				time = null;
			} else {
				time = parseInt(key.split("-").pop());
				if (isNaN(time)) {
					time = null;
				}
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
				nav = store.get("nav"),
				chatAreaClassNames = "main-content-chat chat-area",
				scrollToClassNames = "scroll-to scroll-to-bottom",
				content, before, after, beforeItems, afterItems, positionKey;

			// Don't show
			if (!this.state.show) {
				return <div data-mode="none" />;
			}

			// Enhance chat area layout in modern browsers
			if (window.CSS.supports("display", "flex")) {
				chatAreaClassNames += " chat-area-enhanced";
			}

			before = (nav.textRange.before || 0) + 11; /* one item will get removed */
			after = (nav.textRange.after || 0) + 10;

			beforeItems = store.getTexts(nav.room, nav.thread, nav.textRange.time || null, -before);
			afterItems = store.getTexts(nav.room, nav.thread, nav.textRange.time || null, after);

			atTop = (beforeItems.length < before && beforeItems[0] !== "missing");
			atBottom = (afterItems.length < after && afterItems[afterItems.length - 1] !== "missing");

			if (beforeItems[0] === "missing") {
				beforeItems.shift();
			}

			if (afterItems[afterItems.length - 1] === "missing") {
				afterItems.pop();
			}

			if (beforeItems[beforeItems.length - 1] && afterItems[0] &&
			    beforeItems[beforeItems.length - 1].id === afterItems[0].id) {
				beforeItems.pop();
			} else if (beforeItems.length > before) {
				beforeItems.shift();
			}

			(beforeItems.concat(afterItems)).forEach(function(text, i, items) {
				var key, showtime, continues, continuation;

				if (typeof text === "object") {
					showtime = (i === items.length - 1 || items[i + 1].time - text.time > 60 * 1000);
					continues = (i !== items.length - 1 && items[i + 1].from === text.from &&
								!(text.tags && text.tags.indexOf("hidden") > -1));
					continuation = (i !== 0 && items[i - 1].from === text.from &&
								!(items[i - 1].tags && items[i - 1].tags.indexOf("hidden") > -1));

					key = "chat-list-" + nav.room + "-" + (nav.thread || "all") + "-" + text.id + "-" + text.time;

					if (!atTop && !atBottom && text.time <= nav.textRange.time) {
						positionKey = key;
					}

					chatitems.push(<ChatItem text={text} key={key} showtime={showtime}
						continues={continues} continuation={continuation} />);

				}
			});

			if (nav.textRange.time === 1) {
				positionKey = "top";
			} else if (!nav.textRange.time) {
				positionKey = "bottom";
			}

			if (chatitems.length) {
				content = (
							<div className="chat-area-messages">
								<div className="chat-area-messages-list">
									<Endless key={"chat-area-" + nav.room + "-" + nav.thread}
										items={chatitems} onScroll={this.onScroll}
										position={positionKey}
										atTop={atTop} atBottom={atBottom} />
								</div>
							</div>
				);
			} else {
				content = <div className="chat-area-empty">There are no messages yet :-(</div>;
			}

			if (nav.textRange && nav.textRange.time) {
				scrollToClassNames += " visible";
			}

			return (
					<div className={chatAreaClassNames} data-mode="chat">

						{content}

						<div className="chat-area-actions">
							<div className={scrollToClassNames} onClick={this.scrollToBottom}>Scroll to bottom</div>

							<Compose />
						</div>
					</div>
			);
		},

		getInitialState: function() {
			return { show: false };
		},

		onStateChange: function(changes, next) {
			var thread = store.get("nav", "thread"),
				room = store.get("nav", "room"),
				key = thread ? room + "_" + thread : room;

			if ((changes.nav && (changes.nav.mode || changes.nav.room || changes.nav.thread)) ||
			    (changes.texts && changes.texts[key] && changes.texts[key].length) ||
			    (changes.threads && changes.threads[thread])) {

				if (store.get("nav", "mode") === "chat") {
					this.setState({ show: true });
				} else {
					this.setState({ show: false });
				}
			}

			next();
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return ChatArea;
};
