/* eslint-env browser */

"use strict";

module.exports = function(core, config, store) {
	const React = require("react"),
		  ThreadCard = require("./thread-card.js")(core, config, store),
		  GridView = require("./grid-view.js")(core, config, store),
		  PrivateRoom = require("./private-room.js")(core, config, store),
		  NoSuchRoom = require("./no-such-room.js")(core, config, store),
		  rangeOps = require("../../lib/range-ops.js");

	class ThreadList extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onScroll = this.onScroll.bind(this);
			this.onStateChange = this.onStateChange.bind(this);

			this.state = this.buildInitialState();
		}

		buildInitialState() {
			return {
				show: (store.get("nav", "mode") === "room"),
				read: store.isRoomReadable(),
				items: this.getItems()
			};
		}

		scrollToTop() {
			core.emit("setstate", {
				nav: {
					threadRange: { time: null, after: 5 * this.getCols(), before: 0 }
				}
			});
		}

		getCols() {
			var container = document.querySelector(".main-content-threads"),
				card = document.querySelector(".main-content-threads .grid-item");

			if (!(container && card)) {
				return 1;
			}

			return (Math.floor(container.offsetWidth / card.offsetWidth) || 1);
		}

		getItems() {
			let nav = store.get("nav"),
				before, after, beforeItems, afterItems, beforeCount, afterCount,
				atTop = false, atBottom = false, loading = false,
				cols = this.getCols(), ret;

			before = cols * Math.ceil(((nav.threadRange.before || 0) + Math.max(50, 15 * cols)) / cols) + 1;
			after = cols * Math.ceil(((nav.threadRange.after || 0) + Math.max(50, 15 * cols)) / cols);

			beforeItems = store.getThreads(nav.room, nav.threadRange.time || null, -before);
			afterItems = store.getThreads(nav.room, nav.threadRange.time || null, after);

			atBottom = (beforeItems.length < before && beforeItems[0] !== "missing");
			atTop = (afterItems.length < after && afterItems[afterItems.length - 1] !== "missing");

			if (beforeItems[0] === "missing") {
				loading = true;
				beforeItems.shift();
			}

			if (afterItems[afterItems.length - 1] === "missing") {
				loading = true;
				afterItems.pop();
			}

			// if the last beforeItem and the first afterItem are the same, then pop.
			if (beforeItems[beforeItems.length - 1] && afterItems[0] &&
				beforeItems[beforeItems.length - 1].id === afterItems[0].id) {
				beforeItems.pop();
			}

			if (afterItems.length && afterItems[0].startTime === nav.threadRange.time) {
				afterCount = cols * Math.floor((afterItems.length - 1) / cols) + 1;
			} else {
				afterCount = cols * Math.floor(afterItems.length / cols);
			}

			if (beforeItems.length && beforeItems[beforeItems.length - 1].startTime === nav.threadRange.time) {
				beforeCount = cols * Math.floor((beforeItems.length + 1) / cols) - 1;
			} else {
				beforeCount = cols * Math.floor(beforeItems.length / cols);
			}

			if (!atTop && cols > 1) {
				afterItems = afterItems.slice(0, afterCount);
			}

			if (!atBottom && cols > 1) {
				beforeItems = beforeItems.slice(-beforeCount);
			}

			ret = beforeItems.concat(afterItems);
			ret.loading = loading;
			ret.atTop = atTop;
			ret.atBottom = atBottom;

			var closest = Math.min(ret.length - 1, rangeOps.findIndex(ret, "startTime", nav.threadRange.time || null));
			ret.key = ret.length ? ret[closest].startTime : null;
			return ret;
		}

		onScroll(key, after, before) { /* reverse chronological; below -> before, above -> after */
			var time;

			if (key === "top") {
				time = null;
			} else if (key === "bottom") {
				time = 1;
			} else {
				time = parseInt(key.split("-").pop());
				if (isNaN(time)) {
					time = null;
				}
			}

			core.emit("setstate", {
				nav: {
					threadRange: {
						time: time,
						before: before,
						after: after
					}
				}
			});
		}

		render() {
			var nav = store.get("nav"),
				key = "thread-" + nav.room,
				threadItems,
				items = [], atTop = false, atBottom = true,
				positionKey,
				scrollToClassNames, sections, empty, loading = false;

			// Don"t show
			if (!this.state.show) {
				return <null />;
			}

			if (!this.state.read) {
				return <PrivateRoom data-mode="room" />;
			}

			if (store.getRoom() === "missing") {
				return <NoSuchRoom data-mode="room" />;
			}

			threadItems = this.state.items;
			loading = threadItems.loading;
			atTop = threadItems.atTop;
			atBottom = threadItems.atBottom;
			positionKey = "thread-" + threadItems.key;

			threadItems.forEach(function(thread) {
				var threadKey = "thread-" + thread.startTime;

				if (typeof thread === "object") {
					items.push({
						key: threadKey,
						elem: <ThreadCard roomId={nav.room} thread={thread} />
					});
				}
			});

			items.reverse();

			if (nav.threadRange.time === 1) {
				positionKey = "bottom";
			} else if (!nav.threadRange.time) {
				positionKey = "top";
			}

			sections = [];

			let roomObj = store.getRoom();

			if (roomObj && roomObj.params && roomObj.params.threader && roomObj.params.threader.showAllMessages) {
				sections.push({
					key: "threads-" + nav.room + "-all",
					endless: false,
					items: [{
						key: "thread-all",
						elem: <div className="card card-thread-all" onClick={() => core.emit("setstate", { nav: { thread: null, mode: "chat" }})}>All messages</div>
					}]
				});
			}

			if (items.length) {
				sections.push({
					key: "threads-" + nav.room,
					header: "Discussions",
					endless: true,
					items: items,
					atTop: atTop,
					atBottom: atBottom,
					position: positionKey
				});
			} else {
				empty = (
					<div className="thread-feed-empty blankslate-area">
						{loading ? "Loading discussions..." : <img src="/s/assets/blankslate/no-messages.png" />}
					</div>
				);
			}

			scrollToClassNames = "scroll-to scroll-to-top";

			if (nav.threadRange && nav.threadRange.time) {
				scrollToClassNames += " visible";
			}

			return (
				<div className="main-content-threads">
					{sections && sections.length ? <GridView endlesskey={key} sections={sections} onScroll={this.onScroll} /> : null}
					{empty}
				</div>
			);
		}

		onStateChange(changes) {
			const roomId = store.get("nav", "room"),
				userId = store.get("user"),
				rel = roomId + "_" + userId;

			if ((changes.nav && (changes.nav.room || "thread" in changes.nav)) ||
				(changes.entities && (changes.entities[roomId] || changes.entities[userId] || changes.entities[rel])) || changes.user ||
				(changes.threads && changes.threads[roomId]) ||
				(changes.texts && Object.keys(changes.texts).filter(key => key.indexOf(roomId) === 0).length > 0)
			) {
				this.setState(this.buildInitialState());
			} else if (changes.nav && changes.nav.threadRange) {
				let items = this.state.items,
					threadRange = store.get("nav", "threadRange");

				if (items && items.length) {
					let position = rangeOps.findIndex(items, "startTime", threadRange.time || null),
						top = position - threadRange.after,
						bottom = position + threadRange.before;

					/* top and bottom are screwed up because rendering is
					   reverse chronological while store APIs are chronological. */
					if ((top > 15 || items.atBottom) && (bottom < items.length - 16 || items.atTop)) {
						return;
					}

				}

				this.setState(this.buildInitialState());
			} else if (changes.nav && changes.nav.mode) {
				this.setState({ show: (store.get("nav", "mode") === "room") });
			}
		}

		componentDidMount() {
			core.on("statechange", this.onStateChange, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.onStateChange);
		}
	}

	return ThreadList;
};
