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
			if(isNaN(time)) time = null;
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
			before, after, beforeItems, afterItems;

		cols = (typeof cols === "number" && !isNaN((cols))) ? cols : 1;

		before = cols*Math.round(((nav.threadRange.before || 0) + Math.max(10, 3*cols))/cols)+1;
		after = cols*Math.round(((nav.threadRange.after || 0) + Math.max(10, 3*cols))/cols);

		beforeItems = store.getThreads(nav.room, nav.threadRange.time || null, -before);
		afterItems = store.getThreads(nav.room, nav.threadRange.time || null, after);

		atBottom = (beforeItems.length < before && beforeItems[0] !== "missing");
		atTop = (afterItems.length < after && afterItems[afterItems.length-1] !== "missing");

		if(beforeItems[0] === "missing") beforeItems.shift();
		if(afterItems[afterItems.length-1] == 'missing') afterItems.pop();

		if(beforeItems[beforeItems.length-1] && afterItems[0] &&
		   beforeItems[beforeItems.length-1].id === afterItems[0].id) {
			beforeItems.pop();
		} else {
			beforeItems.shift();
		}
		
		console.log('Threadlist: At\t', new Date(nav.threadRange.time), 
			nav.threadRange.before, nav.threadRange.after, cols, '=>', before, after,
			'\nThreadlist: Got\t', beforeItems.length, afterItems.length, 
			beforeItems[0] && Date(beforeItems[0].startTime), '---',
			afterItems[afterItems.length-1] && Date(afterItems[afterItems.length-1].startTime),
			atTop?'atTop':'', atBottom?'atBottom':'');

		(beforeItems.concat(afterItems).reverse()).forEach(function(thread) {
			if(typeof thread == "object") {
				items.push({
					key: "thread-" + (type ? "-" + type : "") + "-" + thread.startTime,
					elem: (type === "card")?
						<ThreadCard roomId={nav.room} thread={thread} />:
						<ThreadListItem roomId={nav.room} thread={thread} />
				});
			}
		});
		
		return [{
			key: "threads-" + nav.room ,
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
