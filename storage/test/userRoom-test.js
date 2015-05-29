var userRoom = require("../userRoom.js");

it("should make an insert query", function () {
	var query = userRoom({
		id: "actionid8347",
		type: "room",
		user: { id: "userid1" },
		room: {
			id: "roomid1",
			type: "room",
			description: "This is a room.",
			picture: "http://pic.com/abc.gif",
			params: { ha: 43 },
			guides: { hey: 4 }
		},
		time: 1403947387876
	});
	
	console.log(query);
});

it("should make an update query", function () {
	var query = userRoom({
		id: "actionid8347",
		type: "user",
		user: { id: "userid1",
			picture: "http://pic.com/abc.gif",
			identities: ["mailto:hello@world.com"],
			params: { ha: 43 },
			guides: { hey: 4 }
		},
		old: { id: "userid1", description: "old one" },
		room: { id: "roomid1" },
		time: 1403947387876
	});
	
	console.log(query);
});