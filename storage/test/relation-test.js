/*eslint-env mocha*/
/*eslint no-console: 0*/
"use strict";
var relation = require("../actions/relation.js"),
assert = require("assert");
it("query for admit/expel action", function(){
	var index = Math.floor((Math.random() * 2) + 1);
	var typ = ["admit", "expel"];
	var query = relation({
		type: typ[index-1],
		text: "some message",
		user: {id: "userid1"},
		victim: {id: "victimid1"},
		room: {id: "scrolback"},
		role: "owner",
		transitionRole:"follower",
		transitionType:"invite",
		time: 1234567890
	});
	console.log(query);
	assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})',
    hash: '314422190307817038' },
  { '$': 'UPDATE "relations" SET  "role"=${role}, "transitionrole"=${transitionrole}, "transitiontype"=${transitiontype}, "message"=${message}, "officer"=${officer}, "roletime"=${roletime} WHERE "room"=${room} AND "user"=${user}',
    role: 'owner',
    transitionrole: 'follower',
    transitiontype: 'invite',
    message: 'some message',
    officer: 'userid1',
    roletime: new Date(1234567890),
    room: 'scrolback',
    user: 'victimid1' },
  { '$': 'INSERT INTO "relations" ( "room", "user", "role", "transitionrole", "transitiontype", "message", "officer", "roletime" ) SELECT  ${room}, ${user}, ${role}, ${transitionrole}, ${transitiontype}, ${message}, ${officer}, ${roletime} WHERE NOT EXISTS (SELECT 1 FROM relations WHERE "room"=${room} AND "user"=${user} )',
    room: 'scrolback',
    user: 'victimid1',
    role: 'owner',
    transitionrole: 'follower',
    transitiontype: 'invite',
    message: 'some message',
    officer: 'userid1',
    roletime: new Date(1234567890) } ]);
});

it.only("query without any action type", function(){
	var query = relation({
		text: "some message",
		user: {id: "userid2"},
		victim: {id: "victimid2"},
		room: {id: "scrolback1"},
		role: "owner",
		transitionRole:"follower",
		transitionType:"invite",
		time: 1234567890
	});
	console.log(query);
	assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})',
    hash: '314414268526896982' },
  { '$': 'UPDATE "relations" SET  "role"=${role}, "transitionrole"=${transitionrole}, "transitiontype"=${transitiontype}, "message"=${message}, "officer"=${officer}, "roletime"=${roletime} WHERE "room"=${room} AND "user"=${user}',
    role: 'owner',
    transitionrole: 'follower',
    transitiontype: 'invite',
    message: 'some message',
    officer: null,
    roletime: new Date(1234567890),
    room: 'scrolback1',
    user: 'userid2' },
  { '$': 'INSERT INTO "relations" ( "room", "user", "role", "transitionrole", "transitiontype", "message", "officer", "roletime" ) SELECT  ${room}, ${user}, ${role}, ${transitionrole}, ${transitiontype}, ${message}, ${officer}, ${roletime} WHERE NOT EXISTS (SELECT 1 FROM relations WHERE "room"=${room} AND "user"=${user} )',
    room: 'scrolback1',
    user: 'userid2',
    role: 'owner',
    transitionrole: 'follower',
    transitiontype: 'invite',
    message: 'some message',
    officer: null,
    roletime: new Date(1234567890) } ]);
});
