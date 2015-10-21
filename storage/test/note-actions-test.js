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
	assert.deepEqual(query, [ { '$': 'UPDATE "notes" SET "notify" = "notify" || ${notify} WHERE "notify" ? ${user} AND "ref"=${ref} AND "group"=${group} AND "notetype"=${notetype}',
    notify: { user1: null },
    user: 'user1',
    ref: '4egwqyt326gewe23',
    group: 'scrollback',
    notetype: 'mention' } ]);
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
	assert.deepEqual(query, [ { '$': 'INSERT INTO "notes" ( "ref", "notetype", "group", "notify", "time", "notedata" ) VALUES ( ${ref}, ${notetype}, ${group}, ${notify}, ${time}, ${notedata}), (${ref}, ${notetype_1}, ${group}, ${notify_1}, ${time}, ${notedata} )',
    ref: '4egwqyt326gewe23',
    notetype: 'mention',
    group: 'scrollback',
    notify: { testinguser: 80 },
    time: new Date(1433856224914),
    notedata: {},
    notetype_1: 'reply',
    notify_1: { testinguser: 60, testuser3: 60 } } ]);
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
