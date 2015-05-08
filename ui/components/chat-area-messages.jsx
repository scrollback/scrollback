/* eslint-env browser */

"use strict";

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		Endless = require("../../bower_components/endless/endless.js"),
		ChatAreaMessages;

	ChatAreaMessages = React.createClass({
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
				before, after, beforeItems, afterItems, positionKey,
				loading = false;

			// Don't show
			if (!this.state.show) {
				return <div data-mode="none" />;
			}

			// Enhance chat area layout in modern browsers
			if (window.CSS.supports("display", "flex")) {
				chatAreaClassNames += " chat-area-enhanced";
			}

			before = (nav.textRange && nav.textRange.before ? nav.textRange.before : 0) + 11; /* one item will get removed */
			after = (nav.textRange && nav.textRange.after ? nav.textRange.after : 0) + 10;

			beforeItems = store.getTexts(nav.room, nav.thread, nav.textRange.time || null, -before);
			afterItems = store.getTexts(nav.room, nav.thread, nav.textRange.time || null, after);

			atTop = (beforeItems.length < before && beforeItems[0] !== "missing");
			atBottom = (afterItems.length < after && afterItems[afterItems.length - 1] !== "missing");

			if (beforeItems[0] === "missing") {
				loading = true;
				beforeItems.shift();
			}

			if (afterItems[afterItems.length - 1] === "missing") {
				loading = true;
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
				return (
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
				return (
					<div className="chat-area-empty">
						{loading ? "Loading messages..." : <img src="/s/assets/blankslate/no-discussions.png" />}
					</div>
				);
			}
		},

		getInitialState: function() {
			return { show: false };
		},

		onStateChange: function(changes, next) {
			var thread = store.get("nav", "thread"),
				room = store.get("nav", "room"),
				key = thread ? room + "_" + thread : room;

			if ((changes.nav && (changes.nav.mode || changes.nav.room || changes.nav.thread || changes.nav.textRange)) ||
				(changes.texts && changes.texts[key] && changes.texts[key].length)) {

				this.setState({ show: (store.get("nav", "mode") === "chat") });
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

	return ChatAreaMessages;
};
