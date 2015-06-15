/*eslint-env mocha*/
"use strict"

var content1 = require("../queries/content")[0],
	content2 = require("../queries/content")[1],
	assert = require("assert"),
	util = require("util"),
	index = Math.floor((Math.random() * 3) + 1),
	role = ["owner", "moderator", "su"];

it("getThreads query(owner/moderator/su)", function(){
	var query = content1({
		type: "getThreads",
		to: "roomid1",
		user: {
			role: role[index-1]
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
})

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
			role: role[index-1]
		},
		ref: ["someThreaId", "threadId1", "threadId2"]
	});
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT * FROM texts WHERE "to"=${to} AND id IN ($(ids))  LIMIT ${limit}',
  to: 'roomid1',
  ids: [ 'someThreaId', 'threadId1', 'threadId2' ],
  limit: 256 }, "wrong query");
});

//it.only("query with row for getThreads", function(){
//	var q = {
//		type: "getThreads",
//		to: "roomid1",
//		user: {
//			role: role[index-1]
//		},
//		ref: ["someThreaId", "threadId1", "threadId2"]
//	};
//	var query= content2(q, [{
//		"id": "3432h32jk23kjh432",
//		"to": "someroom",
//		"from": "userid",
//		"type": "getThreads",
//		"text": "here is the text",
//		"thread": "24h5523h32k235h32",
//		"tags":[],
//		"time": 1433936562537
//	}]);
//	console.log(q.results);
//})
