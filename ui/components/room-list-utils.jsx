/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard = require("./room-card.jsx")(core, config, store),
		RoomListItem = require("./room-list-item.jsx")(core, config, store),
		titles = {
			owner: "My rooms",
			moderator: "My rooms",
			follower: "Following",
			visitor: "Recently visited"
		};

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

	return {
		getSections: getSections
	};
};

