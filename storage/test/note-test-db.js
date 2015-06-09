/* eslint-env mocha */

"use strict";

var pg = require("../../lib/pg"),
	noteQuery = require("../queries/note"),
	noteAction = require("../actions/note"),
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


it("should insert note 1 into database", function (done) {
	var q = noteAction({
		id: "testactionid1",
		type: "text",
		note: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" },
		notify: {
			"testuser2": { score: 6, noteType: "mention" },
			"testuser3": { score: 2, noteType: "reply" }
		},
		time: 1433831437920
	});
	console.log("Insert query", q)
	pg.write(connStr, q, done);
}); 

it("should insert note 2 into database", function (done) {
	var q = noteAction({
		id: "testactionid2",
		type: "text",
		note: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" },
		notify: {
			"testuser1": { score: 6, noteType: "reply" },
			"testuser3": { score: 2, noteType: "reply" }
		},
		time: 1433831437940
	});
	console.log("Insert query", q)
	pg.write(connStr, q, done);
});

it("should insert note 3 into database", function (done) {
	var q = noteAction({
		id: "testactionid3",
		type: "text",
		note: { data: { from: "testuser1", text: "test message 1" }, group: "testroom1/testthread1" },
		notify: {
			"testuser2": { score: 6, noteType: "reply" },
			"testuser1": { score: 2, noteType: "reply" }
		},
		time: 1433831437970
	});
	console.log("Insert query", q)
	pg.write(connStr, q, done);
});

it("should query user 1 notes from database", function (done) {
	var query = {
		type: "getNotes",
		user: { id: "testuser1" }
	};
	runQuery(noteQuery, query, null, 0, function () {
		console.log("Final results are", query.results);
		done();
	});
});

