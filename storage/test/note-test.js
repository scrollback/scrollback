var action = require("../actions/note.js"),
	query  = require("../queries/note.js"),
	pg = require("../../lib/pg.js"),
	util = require("util"),
	assert = require("assert");

it("should return a note action for a text", function (done) {
	console.log(action({
		id: "testtextid",
		type: "text",
		note: {
			mention: { group: "scrollback", data: {
				title: "some titile",
				text: "some text",
				from: "officer"
			}},
			reply: {
				group: "scrollback", data: {
				title: "some titile",
				text: "some text",
				from: "officer"
			}}
		},
		user: {
			id: "user1"
		},
		notify: {
			"testinguser": {
				 mention: 80,
				 reply: 60
			},
			"testuser2": {
				reply: 30
			},
			"testuser3": {
				reply: 60
			}
		},
		occupants: [
			{ id: "chandrakant" }
		],
		time: 38947982734987
	}));

	done();
});
