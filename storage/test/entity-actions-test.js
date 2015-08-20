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

		assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})', hash: '0' },
  { '$': 'UPDATE "entities" SET  "type"=${type}, "identities"=${identities}, "color"=${color}, "picture"=${picture}, "createtime"=${createtime}, "timezone"=${timezone}, "locale"=${locale}, "params"=${params}, "guides"=${guides}, "terms"=${terms} WHERE "id"=${id}',
    type: 'room',
    identities: [],
    color: 0,
    picture: 'http://pic.com/abc.gif',
    createtime: new Date(1403947387876),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'roomid1 This is a room.',
    id: 'roomid1' },
  { '$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, $(createTime),${timezone}, ${locale}, ${params}, ${guides}, to_tsvector(\'english\', ${terms}) WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})',
    id: 'roomid1',
    type: 'room',
    identities: [],
    color: 0,
    picture: 'http://pic.com/abc.gif',
    createtime: new Date(1403947387876),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'roomid1 This is a room.' },
  { '$': 'INSERT INTO relations(room, "user", role, roletime) VALUES ($(values))',
    values: 
     [ 'roomid1',
       'userid1',
       'owner',
       new Date(1403947387876) ] } ], "Wrong querry for room");
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
		assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})', hash: '0' },
  { '$': 'UPDATE "entities" SET  "type"=${type}, "identities"=${identities}, "color"=${color}, "picture"=${picture}, "createtime"=${createtime}, "timezone"=${timezone}, "locale"=${locale}, "params"=${params}, "guides"=${guides}, "terms"=${terms} WHERE "id"=${id}',
    type: 'user',
    identities: [],
    color: 0,
    picture: 'http://pic.com/dhs.gif',
    createtime: new Date(1403947388975),
    timezone: undefined,
    locale: undefined,
    params: undefined,
    guides: undefined,
    terms: 'testinguser I am Testinguser.',
    id: 'testinguser' },
  { '$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, $(createTime),${timezone}, ${locale}, ${params}, ${guides}, to_tsvector(\'english\', ${terms}) WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})',
    id: 'testinguser',
    type: 'user',
    identities: [],
    color: 0,
    picture: 'http://pic.com/dhs.gif',
    createtime: new Date(1403947388975),
    timezone: undefined,
    locale: undefined,
    params: undefined,
    guides: undefined,
    terms: 'testinguser I am Testinguser.' } ], "wrong querry for user");
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
		assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})', hash: '0' },
  { '$': 'UPDATE "entities" SET  "type"=${type}, "identities"=${identities}, "color"=${color}, "picture"=${picture}, "createtime"=${createtime}, "timezone"=${timezone}, "locale"=${locale}, "params"=${params}, "guides"=${guides}, "terms"=${terms} WHERE "id"=${id}',
    type: undefined,
    identities: [ [ 'mailto', 'mailto:hello@world.com' ] ],
    color: 0,
    picture: 'http://pic.com/abc.gif',
    createtime: new Date(1403947387876),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'userid1 ',
    id: 'userid1' },
  { '$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, $(createTime),${timezone}, ${locale}, ${params}, ${guides}, to_tsvector(\'english\', ${terms}) WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})',
    id: 'userid1',
    type: undefined,
    identities: [ [ 'mailto', 'mailto:hello@world.com' ] ],
    color: 0,
    picture: 'http://pic.com/abc.gif',
    createtime: new Date(1403947387876),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'userid1 ' } ], "wrong update query");
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
		assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})', hash: '0' },
  { '$': 'UPDATE "entities" SET  "type"=${type}, "identities"=${identities}, "color"=${color}, "picture"=${picture}, "createtime"=${createtime}, "timezone"=${timezone}, "locale"=${locale}, "params"=${params}, "guides"=${guides}, "terms"=${terms} WHERE "id"=${id}',
    type: undefined,
    identities: [],
    color: 0,
    picture: 'http://pic.com/ahc.gif',
    createtime: new Date(1403947397432),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'userid5 new one',
    id: 'userid5' },
  { '$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, $(createTime),${timezone}, ${locale}, ${params}, ${guides}, to_tsvector(\'english\', ${terms}) WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})',
    id: 'userid5',
    type: undefined,
    identities: [],
    color: 0,
    picture: 'http://pic.com/ahc.gif',
    createtime: new Date(1403947397432),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'userid5 new one' } ], "wrong update query for description");
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
		assert.deepEqual(query, [ { '$': 'SELECT pg_advisory_xact_lock(${hash})', hash: '0' },
  { '$': 'UPDATE "entities" SET  "type"=${type}, "identities"=${identities}, "color"=${color}, "picture"=${picture}, "createtime"=${createtime}, "timezone"=${timezone}, "locale"=${locale}, "params"=${params}, "guides"=${guides}, "terms"=${terms} WHERE "id"=${id}',
    type: undefined,
    identities: [],
    color: 0,
    picture: 'http://pic.com/ahc.gif',
    createtime: new Date(1403947332421),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'userid5 ',
    id: 'userid5' },
  { '$': 'INSERT INTO entities(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, $(createTime),${timezone}, ${locale}, ${params}, ${guides}, to_tsvector(\'english\', ${terms}) WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})',
    id: 'userid5',
    type: undefined,
    identities: [],
    color: 0,
    picture: 'http://pic.com/ahc.gif',
    createtime: new Date(1403947332421),
    timezone: undefined,
    locale: undefined,
    params: { ha: 43 },
    guides: { hey: 4 },
    terms: 'userid5 ' } ], "wrong update query for delete time");
	});
});
