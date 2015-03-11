/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard = require("./thread-card.jsx")(core, config, store),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, store);

	function onScroll(key, after, before) { /* reverse chronological; below -> before, above -> after */
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

		console.log('Threadrange setting state to ', time);

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

	function getSections(type, cols) {
		var nav = store.getNav(),
			items = [], atTop = false, atBottom = true,
			before, after, beforeCount, afterCount,
			allItems, beforeItems, afterItems;

		cols = (typeof cols === "number" && !isNaN((cols))) ? cols : 1;

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

		// All discussions
		allItems.push({
			title: "All discussions",
			id: null,
			startTime: null
		});

		allItems.reverse().forEach(function(thread) {
			if (typeof thread == "object") {
				items.push({
					key: "thread-" + (type ? "-" + type : "") + "-" + thread.startTime,
					elem: (type === "card") ? <ThreadCard roomId={nav.room} thread={thread} /> : <ThreadListItem roomId={nav.room} thread={thread} />
				});
			}
		});

		return [{
			key: "threads-" + nav.room,
			header: "Discussions",
			items: items,
			atTop: atTop,
			atBottom: atBottom
		}];
	}

	return {
		getSections: getSections,
		onScroll: onScroll
	};
};
