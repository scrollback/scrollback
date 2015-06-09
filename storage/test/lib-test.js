var pg = require("../../lib/pg.js"),
	assert = require("assert");

it("should generate a lock query", function () {
	assert.deepEqual(
		pg.lock("example"), 
		{ $: 'SELECT pg_advisory_xact_lock(${hash})', hash: '28561332491021413' }
	);
});


it("should generate a SET clause", function () {
	assert.deepEqual(
		pg.nameValues({foo: 43, bar: "45"}),
		{ $: '"foo"=${foo}, "bar"=${bar}', foo: 43, bar: '45' }
	);
});

it("should generate a simple WHERE clause", function () {
	assert.deepEqual(
		pg.nameValues({foo: 43, bar: "45"}, " AND "),
		{ $: '"foo"=${foo} AND "bar"=${bar}', foo: 43, bar: '45' }
	);
});

it("should generate an INSERT query", function () {
	assert.deepEqual(
		pg.insert("example", [{foo: 43, bar: "45"}, {foo: 42, bar: "56"}]),
		{ $: 'INSERT INTO "example" ( "foo", "bar" ) VALUES ( ${foo}, ${bar} ) ( ${foo_1}, ${bar_1} )',
		  foo: 43,
		  bar: '45',
		  foo_1: 42,
		  bar_1: '56' }
	);
});

it("should generate an UPDATE query", function () {
	assert.deepEqual(
		pg.update("example", {foo: 43, bar: "45"}),
		{ $: 'UPDATE "example" SET  "foo"=${foo}, "bar"=${bar}',
		  foo: 43,
		  bar: '45' }
	);
});

it("should generate UPSERT queries", function () {
	assert.deepEqual(
		pg.upsert("example", {foo: 43, bar: "45", baz: "a", xyz: "h"}, ["foo", "baz"]),
		[ { $: 'SELECT pg_advisory_xact_lock(${hash})',
		    hash: '1631204403' },
		  { $: 'UPDATE "example" SET  "bar"=${bar}, "xyz"=${xyz} WHERE "foo"=${foo} AND "baz"=${baz}',
			bar: '45',
			xyz: 'h',
			foo: 43,
			baz: 'a' },
		  { $: 'INSERT INTO "example" ( "foo", "bar", "baz", "xyz" ) VALUES ( ${foo}, ${bar}, ${baz}, ${xyz} ) WHERE NOT EXISTS (SELECT 1 FROM example WHERE "foo"=${foo} AND "baz"=${baz} )',
			foo: 43,
			bar: '45',
			baz: 'a',
			xyz: 'h' } ]
	);
});
