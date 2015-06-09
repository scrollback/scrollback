/*eslint-env mocha*/
/*eslint no-console: 0*/
/*eslint no-undefined: 0*/
"use strict";
var entity = require("../actions/entity.js"),
	assert = require("assert"),
	util = require('util');
describe("Insert Query: ", function() {
	it("should make an insert query for room", function() {

		var query = entity({
			id: "actionid8347",
			type: "room",
			user: {
				id: "userid1"
			},
			room: {
				id: "roomid1",
				type: "room",
				description: "This is a room.",
				picture: "http://pic.com/abc.gif",
				params: {
					ha: 43
				},
				guides: {
					hey: 4
				}
			},
			time: 1403947387876
		});
		console.log(util.inspect(query, {
			depth: 4
		}));

		assert.deepEqual(query, [{
				'$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) VALUES (${id}, ${identities}, $(values), to_tsvector(\'english\', ${terms}))',
				values: ['room',
       'This is a room.',
       0,
       'http://pic.com/abc.gif',
       new Date(1403947387876),
       0,
       '',
					{
						ha: 43
					},
					{
						hey: 4
					}],
				terms: 'roomid1 This is a room.',
				id: 'roomid1',
				identities: []
			},
			{
				'$': 'INSERT INTO relations(room, user, role, roletime) VALUES ($(values))',
				values: ['roomid1',
       'userid1',
       'owner',
       new Date(1403947387876)]
			}], "Wrong querry for room");
	});

	it("should make an insert query for user", function() {
		var query = entity({
			id: "actionid8357",
			type: "user",
			user: {
				id: "testinguser",
				type: "user",
				description: "I am Testinguser.",
				picture: "http://pic.com/dhs.gif"
			},
			time: 1403947388975
		});
		console.log(query);
		assert.deepEqual(query, [{
			'$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) VALUES (${id}, ${identities}, $(values), to_tsvector(\'english\', ${terms}))',
			values: ['user',
       'I am Testinguser.',
       0,
       'http://pic.com/dhs.gif',
       new Date(1403947388975),
       0,
       '',
       undefined,
       undefined],
			terms: 'testinguser I am Testinguser.',
			id: 'testinguser',
			identities: []
		}], "wrong querry for user");
	});
});
describe("Update Query: ", function() {
	it("should make an update query", function() {
		var query = entity({
			id: "actionid8347",
			type: "user",
			user: {
				id: "userid1",
				picture: "http://pic.com/abc.gif",
				identities: ["mailto:hello@world.com"],
				params: {
					ha: 43
				},
				guides: {
					hey: 4
				}
			},
			old: {
				id: "userid1",
				description: "old one"
			},
			room: {
				id: "roomid1"
			},
			time: 1403947387876
		});
		console.log(util.inspect(query, {
			depth: 4
		}));
		assert.deepEqual(query, [{
			'$': 'UPDATE entities SET picture=${picture}, params=${params}, guides=${guides}, identities=${identities} WHERE id=${id}',
			picture: 'http://pic.com/abc.gif',
			params: {
				ha: 43
			},
			guides: {
				hey: 4
			},
			identities: [['mailto', 'mailto:hello@world.com']],
			id: 'userid1'
	}], "wrong update query");
	});

	it("should make an update query(description)", function() {
		var query = entity({
			id: "actionid8346",
			type: "user",
			user: {
				id: "userid5",
				picture: "http://pic.com/ahc.gif",
				description: "new one",
				params: {
					ha: 43
				},
				guides: {
					hey: 4
				}
			},
			old: {
				id: "userid1",
				description: "old one"
			},
			room: {
				id: "roomid4"
			},
			time: 1403947397432
		});
		console.log(util.inspect(query, {
			depth: 4
		}));
		assert.deepEqual(query, [{
			'$': 'UPDATE entities SET description=${description}, picture=${picture}, params=${params}, guides=${guides}, terms: to_tsvector(\'english\', ${terms}) WHERE id=${id}',
			description: 'new one',
			picture: 'http://pic.com/ahc.gif',
			params: {
				ha: 43
			},
			guides: {
				hey: 4
			},
			terms: 'userid5 new one',
			id: 'userid5'
	}], "wrong update query for description");
	});

	it("should make an update query(delete time)", function() {
		var query = entity({
			id: "actionid83",
			type: "user",
			user: {
				id: "userid5",
				picture: "http://pic.com/ahc.gif",
				deleteTime: 4039473974325,
				params: {
					ha: 43
				},
				guides: {
					hey: 4
				}
			},
			old: {
				id: "userid1",
				description: "old one"
			},
			room: {
				id: "roomid4"
			},
			time: 1403947332421
		});
		console.log(util.inspect(query, {
			depth: 4
		}));
		assert.deepEqual(query, [{
			'$': 'UPDATE entities SET picture=${picture}, params=${params}, guides=${guides}, deletetime=${deleteTime} WHERE id=${id}',
			picture: 'http://pic.com/ahc.gif',
			params: {
				ha: 43
			},
			guides: {
				hey: 4
			},
			deleteTime: new Date(1403947332421),
			id: 'userid5'
	}], "wrong update query for delete time");
	});
});
