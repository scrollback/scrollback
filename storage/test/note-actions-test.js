/*eslint-env mocha*/
/*eslint no-console: 0*/
/*eslint no-undefined: 0*/
"use strict";
var note = require("../actions/note.js"),
	util = require("util"),
	assert = require("assert");

it("notification query test", function() {
	var query = note({
		type: "note",
		action: "text",
		user: {
			id: "user1"
		},
		noteType: "mention",
		group: "scrollback",
		readTime: 1433856224914,
		time: 1433856224914,
		ref: "4egwqyt326gewe23"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'UPDATE "notes" SET  "readtime"=${readtime} WHERE "user"=${user} AND "ref"=${ref} AND "group"=${group}',
    readtime: new Date(1433856224914),
    user: 'user1',
    ref: '4egwqyt326gewe23',
    group: 'scrollback' } ], "wrong querry");
});

it("notification query test(type text)", function() {
	var query = note({
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
		noteType: "thread",
		ref: "someTextId",
		time: 1433856224914,
		id: "4egwqyt326gewe23"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'INSERT INTO "notes" ( "user", "ref", "notetype", "group", "score", "time", "notedata" ) VALUES ( ${user}, ${ref}, ${notetype}, ${group}, ${score}, ${time}, ${notedata} )',
    user: 'testinguser',
    ref: '4egwqyt326gewe23',
    notetype: 'mention',
    group: 'scrollback',
    score: 40,
    time: new Date(1433856224914),
    notedata: {} } ], "wrong query for notification of text action");
});

it("notification query test(without notify property)", function() {
	var query = note({
		type: "text",
		note: {
			group: "scrollback",
			data: {
				tittle: "some titile",
				text: "some text",
				from: "officer"
			}
		},
		user: {
			id: "user1"
		},
		noteType: "thread",
		ref: "someTextId",
		time: 1433856224914,
		id: "4egwqyt326gewe23"
	});
	console.log(query);
	assert.deepEqual(query,[] , "wrong query for notification of text action");
});
