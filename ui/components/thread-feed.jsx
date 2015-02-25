/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		ThreadCard = require("./thread-card.jsx")(core, config, store),
		ThreadListItem = require("./thread-list-item.jsx")(core, config, store),
		ThreadFeed, ThreadList,
		threadfeedEl = document.getElementById("js-thread-feed"),
		threadlistEl = document.getElementById("js-thread-list");

	ThreadFeed = React.createClass({
		render: function() {
			return (<GridView sections={this.props.sections} />);
		}
	});

	ThreadList = React.createClass({
		render: function() {
			return (<ListView sections={this.props.sections} />);
		}
	});

	function getItems(type) {
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

	core.on("statechange", function(changes, next) {
		if ("threads" in changes || (changes.nav && (changes.nav.room || changes.nav.thread || changes.nav.mode))) {
			switch (store.getNav().mode) {
			case "room":
				React.render(<ThreadFeed sections={getItems("card")} />, threadfeedEl);
				break;
			case "chat":
				React.render(<ThreadList sections={getItems("list")} />, threadlistEl);
				break;
			}
		}

		next();
	}, 500);

	return ThreadFeed;
};
