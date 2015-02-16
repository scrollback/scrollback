/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, state),
		GridView = require("./grid-view.jsx")(core, config, state),
		ThreadCard = require("./thread-card.jsx")(core, config, state),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, state),
		ThreadFeed, ThreadList,
		threadfeed = document.getElementById("js-thread-feed"),
		threadlist = document.getElementById("js-thread-list");

	function getItems(type) {
		var roomId = state.getNav().room,
			items = [];

		state.getThreads(roomId, null, -10).reverse().forEach(function(thread) {
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

	ThreadFeed = React.createClass({
		render: function() {
			return (<GridView sections={getItems("card")} />);
		}
	});

	ThreadList = React.createClass({
		render: function() {
			return (<ListView sections={getItems("list")} />);
		}
	});

	core.on("statechange", function(changes, next) {
		if ("threads" in changes || ("nav" in changes && ("room" in changes.nav || "thread" in changes.nav || "mode" in changes.nav))) {
			switch (state.getNav().mode) {
			case "room":
				React.render(<ThreadFeed />, threadfeed);
				break;
			case "chat":
				React.render(<ThreadList />, threadlist);
				break;
			}
		}

		next();
	}, 500);

	return ThreadFeed;
};
