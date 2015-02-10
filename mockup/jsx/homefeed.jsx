/* jshint browser: true */
/* global $, state */

var React = require("react"),
	GridView = require("./gridview.jsx"),
	RoomCard = require("./roomcard.jsx"),
	room, sections;

// room = {
//  	room: "somename",
//  	cover: "http://example.com/cover.jpg",
//  	picture: "http://example.com/logo.jpg",
//  	mentions: 23,
//  	messages: 54,
//  	color: "#00aaff",
// 	discussions: [
// 		{ title: "Thread title 1", from: "someone" },
//  		{ title: "Thread title 2", from: "someother" }
//  	]
//  };

// sections = [
// 	{
// 		key: "somekey",
// 		header: "Some header",
// 		items: [
// 			{ some: <RoomCard room={room} /> },
// 			{ other: <RoomCard room={room} /> },
// 			{ none: <RoomCard room={room} /> },
// 			{ sucks: <RoomCard room={room} /> },
// 			{ klaus: <RoomCard room={room} /> },
// 			{ wolf: <RoomCard room={room} /> },
// 			{ vampire: <RoomCard room={room} /> }
// 		]
// 	},
// 	{
// 		key: "otherkey",
// 		header: "Another header",
// 		items: [
// 			{ someth: <RoomCard room={room} /> },
// 			{ lalal: <RoomCard room={room} /> },
// 			{ grrr: <RoomCard room={room} /> },
// 			{ life: <RoomCard room={room} /> },
// 			{ pain: <RoomCard room={room} /> }
// 		]
// 	}
// ];


module.exports = function(core) {
	var titles = {
			owner: "My rooms",
			moderator: "My rooms",
			member: "Following",
			visitor: "Recently visited"
		};

	core.on("statechange", function(changes, next) {
		var relations, roomitem,
			sections = {}, arr = [];

		if (!(changes && changes.indexes && changes.indexes.userRooms && changes.indexes.userRooms[state.get("userId")])) {
			return next();
		}

		relations = state.get("indexes", "userRooms", state.get("userId"));

		relations.forEach(function(rel) {
			sections[rel.role] = sections[rel.role] || {
				key: rel.role,
				header: titles[rel.role],
				items: []
			};

			roomitem = {};

			roomitem["room-card-" + rel.room] = <RoomCard roomId={rel.room} discussionCount="2" />;

			sections[rel.role].items.push(roomitem);
		});

		for (var role in sections) {
			arr.push({
				key: sections[role].key,
				header: sections[role].header,
				items: sections[role].items
			});
		}

		React.render(<GridView sections={arr} />, $(".main-content-rooms").get(0));

		next();
	}, 500);
};

