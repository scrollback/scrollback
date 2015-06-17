/*eslint-env mocha*/
"use strict";

var content1 = require("../queries/content")[0],
	assert = require("assert");

it("getThreads query(owner)", function(){
	var query = content1({
		type: "getThreads",
		to: "roomid1",
		user: {
			role: "owner"
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM threads WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong querry");
});

it("getThreads query(moderator)", function(){
	var query = content1({
		type: "getThreads",
		to: "roomid1",
		user: {
			role: "moderator"
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM threads WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong querry");
});

it("getThreads query(su)", function(){
	var query = content1({
		type: "getThreads",
		to: "roomid1",
		user: {
			role: "su"
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM threads WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong querry");
});

it("getThreads query(guest)", function(){
	var query = content1({
		type: "getThreads",
		to: "roomid1",
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM threads WHERE "to"=${to} AND NOT("tags" @> ${hidden}) AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  hidden: [ 'thread-hidden' ],
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong query");
});

it("getTexts query(guest)", function(){
	var query = content1({
		type: "getTexts",
		to: "roomid1",
		time: 1433932870481,
		after: 23
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM texts WHERE "to"=${to} AND NOT("tags" @> ${hidden}) AND "time" >= ${start} ORDER BY time ASC LIMIT ${limit}',
  to: 'roomid1',
  hidden: [ 'hidden' ],
  start: new Date(1433932870481),
  limit: 23 }, "wrong query");
});

it("getTexts query(owner/moderator/su)", function(){
	var query = content1({
		type: "getTexts",
		to: "roomid1",
		user: {
			role: "owner"
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM texts WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong query");
});


it("getTexts query(moderator)", function(){
	var query = content1({
		type: "getTexts",
		to: "roomid1",
		user: {
			role: "moderator"
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM texts WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong query");
});

it("getTexts query(su)", function(){
	var query = content1({
		type: "getTexts",
		to: "roomid1",
		user: {
			role: "su"
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM texts WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong query");
});
