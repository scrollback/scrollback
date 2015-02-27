/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ListView = require("./list-view.jsx")(core, config, store),
		GridView = require("./grid-view.jsx")(core, config, store),
		RoomCard = require("./room-card.jsx")(core, config, store),
		RoomListItem = require("./room-list-item.jsx")(core, config, store),
		HomeFeed, RoomList,
		titles = {
			owner: "My rooms",
			moderator: "My rooms",
			follower: "Following",
			visitor: "Recently visited"
		},
		homefeedEl = document.getElementById("js-home-feed"),
		roomlistEl = document.getElementById("js-room-list");

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

		store.getRelatedRooms().forEach(function(rel) {
			sections[rel.role] = sections[rel.role] || {
				key: "home-feed-" + rel.role,
				header: titles[rel.role],
				items: []
			};

			sections[rel.role].items.push({
				key: "home-feed-room-card-" + rel.room,
				elem: (type === "list") ?  <RoomListItem roomId={rel.room} /> : <RoomCard roomId={rel.room} threadCount="3" />
			});
		});

		for (var role in sections) {
			arr.push({
				key: "home-feed-" + sections[role].key + (type ? "-" + type : ""),
				header: sections[role].header,
				items: sections[role].items
			});
		}

		return arr;
	}

	core.on("statechange", function(changes, next) {
		if (changes.indexes && "userRooms" in changes.indexes) {
			switch (store.getNav().mode) {
			case "home":
				React.render(<HomeFeed sections={getSections("card")} />, homefeedEl);
				break;
			case "room":
				React.render(<RoomList sections={getSections("list")} />, roomlistEl);
				break;
			}
		}

		next();
	}, 500);

	return HomeFeed;
};

