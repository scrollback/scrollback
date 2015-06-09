/*eslint-env mocha*/
/*eslint no-console: 0*/
"use strict";
var note = require("../actions/note.js"),
	util = require("util"),
	assert = require("assert");

it("notification query test", function() {
	var query = note({
		type: "note",
		action: "mntion",
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
	assert.deepEqual(query, [ { '$': 'UPDATE "notes" SET  "user"=${user}, "action"=${action}, "group"=${group}, "notetype"=${notetype}, "ref"=${ref}, "readTime"=${readTime}',
    user: 'user1',
    action: 'mntion',
    group: 'scrollback',
    notetype: 'mention',
    ref: '4egwqyt326gewe23',
    readTime: new Date(1433856224914) } ], "wrong querry");
});

it("notification query test(type text)", function() {
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
		notify: {
			"testinguser": {score: 4, noteType: "mention"},
			"sbtestinguser": {score: 4, noteType: "thread"},
			"user1": {score: 4, noteType: "reply"},
			"user2": {score: 4, noteType: "mention"}
		},
		noteType: "thread",
		ref: "someTextId",
		time: 1433856224914,
		id: "4egwqyt326gewe23"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'INSERT INTO "notes" ( "user", "action", "ref", "notetype", "group", "score", "time", "notedata" ) VALUES ( ${user}, ${action}, ${ref}, ${notetype}, ${group}, ${score}, ${time}, ${notedata}), (${user_1}, ${action}, ${ref}, ${notetype_1}, ${group}, ${score}, ${time_1}, ${notedata}), (${user_2}, ${action}, ${ref}, ${notetype_2}, ${group}, ${score}, ${time_2}, ${notedata}), (${user_3}, ${action}, ${ref}, ${notetype}, ${group}, ${score}, ${time_3}, ${notedata} )',
    user: 'testinguser',
    action: 'text',
    ref: '4egwqyt326gewe23',
    notetype: 'mention',
    group: 'scrollback',
    score: 4,
    time: new Date(1433856224914),
    notedata: { tittle: 'some titile', text: 'some text', from: 'officer' },
    user_1: 'sbtestinguser',
    notetype_1: 'thread',
    time_1: new Date(1433856224914),
    user_2: 'user1',
    notetype_2: 'reply',
    time_2: new Date(1433856224914),
    user_3: 'user2',
    time_3: new Date(1433856224914) } ], "wrong query for notification of text action");
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
