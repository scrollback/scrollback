/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard = require("./thread-card.jsx")(core, config, store),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ListView = require("./list-view.jsx")(core, config, store),
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
			var container, card;

			if (this.props.type === "feed") {
				container = document.querySelector(".main-content-threads");
				card = document.querySelector(".main-content-threads .grid-item");

				if (!(container && card)) {
					return 1;
				}

				return (Math.floor(container.offsetWidth / card.offsetWidth) || 1);
			} else {
				return 1;
			}
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
				type = this.props.type,
				key = "thread-" + type + "-" + nav.room,
				items = [], atTop = false, atBottom = true,
				before, after, beforeCount, afterCount,
				allItems, beforeItems, afterItems, positionKey,
				scrollToClassNames, cols, sections;

			// Don't show
			if (!((nav.mode === "room" && type === "feed") || nav.mode === "chat")) {
				return <div />;
			}

			cols = this.getCols();

			before = cols * Math.ceil(((nav.threadRange.before || 0) + Math.max(10, 3 * cols)) / cols) + 1;
			after = cols * Math.ceil(((nav.threadRange.after || 0) + Math.max(10, 3 * cols)) / cols);

			beforeItems = store.getThreads(nav.room, nav.threadRange.time || null, -before);
			afterItems = store.getThreads(nav.room, nav.threadRange.time || null, after);

			atBottom = (beforeItems.length < before && beforeItems[0] !== "missing");
			atTop = (afterItems.length < after && afterItems[afterItems.length - 1] !== "missing");

			if (beforeItems[0] === "missing") {
				beforeItems.shift();
			}

			if (afterItems[afterItems.length - 1] === "missing") {
				afterItems.pop();
			}

			// if the last beforeItem and the first afterItem are the same, then pop.
			if (beforeItems[beforeItems.length - 1] && afterItems[0] &&
			   beforeItems[beforeItems.length - 1].id === afterItems[0].id) {
				beforeItems.pop();
			} else {
				beforeItems.shift();
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
				var key = "thread-" + (type ? "-" + type : "") + "-" + thread.startTime;

				if (typeof thread == "object") {
					if (nav.threadRange.time && thread.startTime >= nav.threadRange.time) {
						positionKey = key;
					}

					items.push({
						key: key,
						elem: (type === "feed") ? <ThreadCard roomId={nav.room} thread={thread} /> : <ThreadListItem roomId={nav.room} thread={thread} />
					});
				}
			});

			if (nav.threadRange.time === 1) {
				positionKey = 'bottom';
			} else if (nav.threadRange.time === null) {
				positionKey = 'top';
			}

			var allThread = {
				title: "All discussions",
				id: null,
				startTime: null
			};

			sections = [{
				key: "threads-" + nav.room + "-all",
				endless: false,
				items: [{
					key: "thread-" + (type ? "-" + type : "") + "-all",
					elem: <ThreadListItem roomId={nav.room} thread={allThread} />
				}]
			}, {
				key: "threads-" + nav.room,
				header: "Discussions",
				endless: true,
				items: items,
				atTop: atTop,
				atBottom: atBottom,
				position: positionKey
			}];

			if (type === "feed") {
				scrollToClassNames = "thread-feed-scroll-to scroll-to";

				if (nav.threadRange && nav.threadRange.time) {
					scrollToClassNames += " visible";
				}

				return (
						<div className="main-content-threads" data-mode="room">
							{/*<div className={scrollToClassNames} onClick={this.scrollToTop}>Scroll to top</div>*/}
							<GridView endlesskey={key} sections={sections} onScroll={this.onScroll} />
						</div>
				);
			} else {
				return (<ListView endlesskey={key} sections={sections} onScroll={this.onScroll} />);
			}
		}
	});

	return ThreadList;
};
