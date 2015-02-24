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
			member: "Following",
			visitor: "Recently visited"
		},
		homefeed = document.getElementById("js-home-feed"),
		roomlist = document.getElementById("js-room-list");

	function getSections(type) {
		var sections = {}, arr = [];

		store.get("indexes", "userRooms", store.get("user")).forEach(function(rel) {
			sections[rel.role] = sections[rel.role] || {
				key: "home-feed-" + rel.role,
				header: titles[rel.role],
				items: []
			};

			sections[rel.role].items.push({
				key: "home-feed-room-card-" + rel.room,
				elem: (type === "list") ?  <RoomListItem roomId={rel.room} /> : <RoomCard roomId={rel.room} threadCount="2" />
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

	HomeFeed = React.createClass({
		render: function() {
			return (<GridView sections={getSections("card")} />);
		}
	});

	RoomList = React.createClass({
		render: function() {
			return (<ListView sections={getSections("list")} />);
		}
	});

	core.on("statechange", function(changes, next) {
		if ("indexes" in changes && "userRooms" in changes.indexes) {
			switch (store.getNav().mode) {
			case "home":
				React.render(<HomeFeed />, homefeed);
				break;
			case "room":
				React.render(<RoomList />, roomlist);
				break;
			}
		}

		next();
	}, 500);

	return HomeFeed;
};

