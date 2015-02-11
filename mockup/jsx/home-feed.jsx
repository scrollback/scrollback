/* jshint browser: true */
/* global $, state */

var React = require("react"),
	ListView = require("./list-view.jsx"),
	GridView = require("./grid-view.jsx"),
	RoomCard = require("./room-card.jsx"),
	RoomListItem = require("./room-list-item.jsx"),
	HomeFeed, RoomList,
	titles = {
		owner: "My rooms",
		moderator: "My rooms",
		member: "Following",
		visitor: "Recently visited"
	};

HomeFeed = React.createClass({
	render: function() {
		return (<GridView sections={this.props.sections} />);
	}
});

RoomList = React.createClass({
	render: function() {
		return (<ListView sections={this.props.sections} />);
	}
});

function getSections(type) {
	var sections = {}, arr = [];

	state.get("indexes", "userRooms", state.get("userId")).forEach(function(rel) {
		sections[rel.role] = sections[rel.role] || {
			key: rel.role,
			header: titles[rel.role],
			items: []
		};

		sections[rel.role].items.push({
			key: "room-card-" + rel.room,
			elem: (type === "small") ?  <RoomListItem roomId={rel.room} /> : <RoomCard roomId={rel.room} discussionCount="2" />
		});
	});

	for (var role in sections) {
		arr.push({
			key: sections[role].key,
			header: sections[role].header,
			items: sections[role].items
		});
	}

	return arr;
}

module.exports = function(core) {
	core.on("statechange", function(changes, next) {
		var mode = state.get("nav", "mode");

		if (!(changes && changes.indexes && changes.indexes.userRooms)) {
			return next();
		}

		if (mode === "home") {
			React.render(<HomeFeed sections={getSections()} />, $(".js-home-feed").get(0));
		}

		if (mode === "room") {
			React.render(<RoomList sections={getSections("small")} />, $(".js-room-list").get(0));
		}

		next();
	}, 500);
};

