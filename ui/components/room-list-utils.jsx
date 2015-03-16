/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		RoomCard = require("./room-card.jsx")(core, config, store),
		RoomListItem = require("./room-list-item.jsx")(core, config, store),
		titles = {
			visitor: "Recently visited",
			owner: "My rooms",
			moderator: "Moderated rooms",
			follower: "Following",
			featured: "Featured rooms"
		};

	function getSections(type) {
		var sections = {}, arr = [];

		for (var t in titles) {
			sections[t] = {
				key: "home-feed-" + t,
				header: titles[t],
				items: []
			};
		}

		store.getRelatedRooms().forEach(function(room) {
			if (typeof room !== "object") {
				return;
			}
			room.role = room.role || "visitor";
			sections[room.role].items.push({
				key: "home-feed-room-card-" + room.role + "-" + room.id,
				elem: (type === "list") ?  <RoomListItem roomId={room.id} /> : <RoomCard roomId={room.id} threadCount="3" />
			});
		});

		store.getFeaturedRooms().forEach(function(room) {
			if (typeof room !== "object") {
				return;
			}

			sections.featured.items.push({
				key: "home-feed-room-card-featured-" + room.id,
				elem: (type === "list") ?  <RoomListItem roomId={room.id} /> : <RoomCard roomId={room.id} threadCount="3" />
			});
		});

		for (var role in sections) {
			if (sections[role].items.length) {
				arr.push({
					key: "home-feed-" + sections[role].key + (type ? "-" + type : ""),
					header: sections[role].header,
					items: sections[role].items
				});
			}
		}

		return arr;
	}

	return {
		getSections: getSections
	};
};
