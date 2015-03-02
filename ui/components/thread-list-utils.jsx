/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard = require("./thread-card.jsx")(core, config, store),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, store);

	function getSections(type) {
		var roomId = store.getNav().room,
			items = [];

		store.getThreads(roomId, null, -50).reverse().forEach(function(thread) {
			if (typeof thread !== "object" || typeof thread.id !== "string") {
				return;
			}

			items.push({
				key: "thread-card-" + thread.id + (type ? "-" + type : ""),
				elem: (type === "card") ? <ThreadCard roomId={roomId} thread={thread} /> : <ThreadListItem roomId={roomId} thread={thread} />
			});
		});

		return [{
			key: "threads-" + roomId ,
			header: "Discussions",
			items: items
		}];
	}

	return {
		getSections: getSections
	};
};
