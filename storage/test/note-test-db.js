/* eslint-env mocha */

"use strict";

var pg = require("../../lib/pg"),
	pglib = require("pg"),
	noteQuery = require("../queries/note"),
	noteAction = require("../actions/note"),
	assert = require("assert"),
	connStr = "pg://scrollback@localhost/scrollback";


function runQuery(handlers, query, results, i, callback) {
	var sql;
	if(i < handlers.length && (sql = handlers[i](query, results))) {
		console.log("Running query", query);
		pg.read(connStr, sql, function (err, res) {
			runQuery(handlers, query, res, i + 1, callback);
		});
	} else {
		callback();
	}
}


describe("note tests that touch the db", function () {
	
	before(function (done) {
		pglib.connect(connStr, function(error, client, release) {
			client.query("TRUNCATE \"notes\"", function (queryErr, result) {
				release();
				done();
			})
		});
	})


	it("should insert note 1 into database", function (done) {
		var q = noteAction({
			id: "testactionid1",
			type: "text",
			note: {
				mention: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" },
				reply: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" }
			},
			notify: {
				"testuser2": { mention: 60 },
				"testuser3": { reply: 40 }
			},
			time: 1433831437920
		});
		pg.write(connStr, q, done);
	}); 

	it("should insert note 2 into database", function (done) {
		var q = noteAction({
			id: "testactionid2",
			type: "text",
			note: {
				mention: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" },
				reply: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" }
			},
			notify: {
				"testuser1": { mention: 60 },
				"testuser3": { reply: 40 }
			},
			time: 1433831437940
		});
		pg.write(connStr, q, done);
	});

	it("should insert note 3 into database", function (done) {
		var q = noteAction({
			id: "testactionid3",
			type: "text",
			note: {
				mention: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" },
				reply: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" }
			},
			notify: {
				"testuser2": { mention: 60 },
				"testuser1": { reply: 40 }
			},
			time: 1433831437970
		});
		pg.write(connStr, q, done);
	});

	it("should query user 1 notes from database", function (done) {
		var query = {
			type: "getNotes",
			user: { id: "testuser1" }
		};
		runQuery(noteQuery, query, null, 0, function () {
			assert.deepEqual(query.results, [
				{
					noteType: 'reply',
					group: 'testroom1/testthread1',
					ref: 'testactionid3',
					score: 40,
					time: 1433831437970,
					noteData: {},
					count: 1
				},
				{
					noteType: 'mention',
					group: 'testroom1/testthread1',
					ref: 'testactionid2',
					score: 60,
					time: 1433831437940,
					noteData: {},
					count: 1 
				}
			]);
			done();
		});
	});
	
	it("should dismiss all notes of testuser1", function (done) {
		var q = noteAction({
			type: "note",
			user: { id: "testuser1" }
		});
		
		console.log(q);
		
		pg.write(connStr, q, done);
	});

});