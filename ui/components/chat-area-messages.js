/* eslint-env browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  ChatItem = require("./chat-item.js")(core, config, store),
		  Endless = require("endless"),
		  rangeOps = require("../../lib/range-ops.js");

	let ChatAreaMessages = React.createClass({
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

			this.currentTime = time;

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

		getItems: function(textRange) {
			var before, after, beforeItems, afterItems,
				atTop = false, atBottom = false, loading = false,
				roomId = store.get("nav", "room"),
				threadId = store.get("nav", "thread"),
				ret;

			before = (textRange && textRange.before ? textRange.before : 0) + 51; /* one item will get removed */
			after = (textRange && textRange.after ? textRange.after : 0) + 50;

			beforeItems = store.getTexts(roomId, threadId, textRange.time || null, -before);
			afterItems = store.getTexts(roomId, threadId, textRange.time || null, after);

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

			ret = beforeItems.concat(afterItems);
			ret.loading = loading;
			ret.atTop = atTop;
			ret.atBottom = atBottom;

			return ret;
		},

		render: function() {
			var chatitems = [], atTop = false, atBottom = true,
				textRange = store.get("nav", "textRange"),
				roomId = store.get("nav", "room"),
				threadId = store.get("nav", "thread"),
				chatAreaClassNames = "main-content-chat chat-area",
				positionKey, textItems, loading;

			// Enhance chat area layout in modern browsers
			if (window.CSS.supports("display", "flex")) {
				chatAreaClassNames += " chat-area-enhanced";
			}

			textItems = this.state.items;
			loading = textItems.loading;
			atTop = textItems.atTop;
			atBottom = textItems.atBottom;

			textItems.forEach(function(text, i, items) {
				var key, showtime, continues, continuation;

				if (typeof text === "object") {
					showtime = (i === items.length - 1 || items[i + 1].time - text.time > 60 * 1000);
					continues = (i !== items.length - 1 && items[i + 1].from === text.from &&
								!(text.tags && text.tags.indexOf("hidden") > -1));
					continuation = (i !== 0 && items[i - 1].from === text.from &&
								!(items[i - 1].tags && items[i - 1].tags.indexOf("hidden") > -1));

					key = "chat-list-" + roomId + "-" + (threadId || "all") + "-" + text.id + "-" + text.time;

					if (!atTop && !atBottom && text.time <= textRange.time) {
						positionKey = key;
					}

					chatitems.push(<ChatItem text={text} key={key} showtime={showtime}
						continues={continues} continuation={continuation} />);

				}
			});

			if (textRange.time === 1) {
				positionKey = "top";
			} else if (!textRange.time) {
				positionKey = "bottom";
			}

			if (chatitems.length) {
				return (
							<div className="chat-area-messages">
								<div className="chat-area-messages-list">
									<Endless key={"chat-area-" + roomId + "-" + threadId}
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
			return { items: this.getItems(store.get("nav", "textRange")) };
		},

		onStateChange: function(changes) {
			const thread = store.get("nav", "thread"),
				  roomId = store.get("nav", "room"),
				  key = thread ? roomId + "_" + thread : roomId;

			if (changes.texts && changes.texts[key] && changes.texts[key].length) {
				this.setState(this.getInitialState());
			} else if (changes.nav && changes.nav.textRange) {
				let items = this.state.items,
					textRange = store.get("nav", "textRange");

				if (items && items.length) {
					let position = rangeOps.findIndex(items, "time", textRange.time || null),
						top = position - textRange.before,
						bottom = position + textRange.after;

					if ((top > 5 || items.atTop) && (bottom < items.length - 6 || items.atBottom) && textRange.time === this.currentTime) {
/*						console.log(items.atTop, 0, top, position, bottom, items.length, items.atBottom);*/
						return;
					}

				}

				this.setState(this.getInitialState());
			}
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 400);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return ChatAreaMessages;
};
