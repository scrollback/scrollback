/* jshint browser: true */
/* global state */

module.exports = function(core) {
	var React = require("react"),
		GridView = require("./gridview.js"),
		RoomCard = require("./roomcard.js"),
		headers = [ "owner", "moderator", "member", "visitor" ],
		titles = {
			owner: "My rooms",
			moderator: "My rooms",
			member: "Following",
			visitor: "Recently visited"
		};

	core.on("statechange", function(changes) {
		var relations, sectionsarr,
			sections = {};

		if (!(changes && changes.indexes && changes.indexes.userRooms && changes.indexes.userRooms[state.get("userId")])) {
			return;
		}

		relations = state.get("indexes", "userRooms", state.get("userId"));

		relations.forEach(function(rel) {
			sections[rel.role] = sections[rel.role] || { header: titles[rel.role], items: []};
			sections[rel.role].push(<RoomCard roomId={rel.roomId} discussionCount="2" />);
		});

		sectionsarr = headers.map(function(role) {
			sections[role].items.sort(function (a, b) {
				return state.getThreads(a.roomId, null, -1).updateTime - state.getThreads(b.roomId, null, -1).updateTime;
			});

			return sections[role];
		});

		React.render(<GridView sections={sectionsarr} />, document.getElementByClassName(".main-content-rooms"));
	}, 500);
};


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

// data = {
// 	sections: [
// 		{
// 			header: "Some header",
// 			items: [
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />
// 			]
// 		},
// 		{
// 			header: "Another header",
// 			items: [
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />,
// 				<RoomCard data={room} />
// 			]
// 		}
// 	]
// };




