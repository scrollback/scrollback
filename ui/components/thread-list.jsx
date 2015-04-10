/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard = require("./thread-card.jsx")(core, config, store),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadList;

	ThreadList = React.createClass({
		scrollToTop: function() {
			core.emit("setstate", {
				nav: {
					threadRange: { time: null, after: 5 * this.getCols(), before: 0 }
				}
			});
		},

		getCols: function() {
			var container = document.querySelector(".main-content-threads"),
				card = document.querySelector(".main-content-threads .grid-item");

			if (!(container && card)) {
				return 1;
			}

			return (Math.floor(container.offsetWidth / card.offsetWidth) || 1);
		},

		onScroll: function(key, after, before) { /* reverse chronological; below -> before, above -> after */
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
		},

		render: function() {
			var nav = store.get("nav"),
				key = "thread-" + nav.room,
				items = [], atTop = false, atBottom = true,
				before, after, beforeCount, afterCount,
				allItems, beforeItems, afterItems, positionKey,
				scrollToClassNames, cols, sections, empty, loading;

			// Don't show
			if (!this.state.show) {
				return <div data-mode="none" />;
			}

			cols = this.getCols();

			before = cols * Math.ceil(((nav.threadRange.before || 0) + Math.max(10, 3 * cols)) / cols) + 1;
			after = cols * Math.ceil(((nav.threadRange.after || 0) + Math.max(10, 3 * cols)) / cols);

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

			allItems = beforeItems.concat(afterItems);

			allItems.reverse().forEach(function(thread) {
				var key = "thread-" + thread.startTime;

				if (typeof thread === "object") {
					if (nav.threadRange.time && thread.startTime >= nav.threadRange.time) {
						positionKey = key;
					}

					items.push({
						key: key,
						elem: <ThreadCard roomId={nav.room} thread={thread} />
					});
				}
			});

			if (nav.threadRange.time === 1) {
				positionKey = 'bottom';
			} else if (!nav.threadRange.time) {
				positionKey = 'top';
			}

			var allThread = {
				title: "All messages",
				id: null,
				startTime: null
			};

			sections = [{
				key: "threads-" + nav.room + "-all",
				endless: false,
				items: [{
					key: "thread-all",
					elem: <ThreadListItem roomId={nav.room} thread={allThread} />
				}]
			}];

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
			}

			if (!items.length) {
				empty = (
				        <div className = {"thread-empty"}>
							{loading ? "Loading discussions..." : "There are no discussions yet :-("}
						</div>
						);
			}

			scrollToClassNames = "scroll-to scroll-to-top";

			if (nav.threadRange && nav.threadRange.time) {
				scrollToClassNames += " visible";
			}

			return (
				<div className="main-content-threads">
					{/*<div className={scrollToClassNames} onClick={this.scrollToTop}>Scroll to top</div>*/}
					<GridView endlesskey={key} sections={sections} onScroll={this.onScroll} />
					{empty}
				</div>
			);
		},

		getInitialState: function() {
			return { show: false };
		},

		onStateChange: function(changes, next) {
			var room = store.get("nav", "room");

			if ((changes.nav && (changes.nav.mode || changes.nav.room || changes.nav.thread)) ||
			    (changes.threads && changes.threads[room])) {

				this.setState({ show: (store.get("nav", "mode") === "room") });
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

	return ThreadList;
};
