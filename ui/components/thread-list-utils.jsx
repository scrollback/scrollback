/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard = require("./thread-card.jsx")(core, config, store),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, store);


	function onScroll(key, before, after) {
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
			before, after, beforeItems, afterItems;

			cols = (typeof cols === "number" && !isNaN((cols))) ? cols : 1;

			before = (nav.threadRange.before || 0) + (3 * cols);
			after = (nav.threadRange.after || 0) + (3 * cols);

			beforeItems = store.getThreads(nav.room, nav.threadRange.time, -before);
			afterItems = store.getThreads(nav.room, nav.threadRange.time, after);

			atTop = (beforeItems.length < before && beforeItems[0] !== "missing");
			atBottom = (afterItems.length < after && afterItems[afterItems.length-1] !== "missing");

			if (beforeItems[beforeItems.length-1] === afterItems[0] || (
			   beforeItems[beforeItems.length-1] && afterItems[0] &&
			   beforeItems[beforeItems.length-1].id === afterItems[0].id)) {
				beforeItems.pop();
				before--;
			}

			(beforeItems.concat(afterItems)).forEach(function(thread) {
			if (typeof thread !== "object" || typeof thread.id !== "string") {
				return;
			}

			items.push({
				key: "thread-card-" + thread.id + (type ? "-" + type : ""),
				elem: (type === "card") ? <ThreadCard roomId={nav.room} thread={thread} /> : <ThreadListItem roomId={nav.room} thread={thread} />
			});
		});

		return [{
			key: "threads-" + nav.room ,
			header: "Discussions",
			items: items
		}];
	}

	return {
		getSections: getSections,
		onScroll: onScroll
	};
};
