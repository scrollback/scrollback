/* global describe, it */

var rangeOps = require("../range-ops.js"),
	assert = require('assert');

it('should insert within a bounded range', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 24}]}],
			{start: 10, end: 20, items: [{i: 15}]},
			"i"
		),
		[{ start: 0, end: 25, items: [{i: 3}, {i: 15}, {i: 24}]}]
	);
});

it('should insert into an endless range 1', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 10, end: 20, items: [{i: 15}]},
			"i"
		),

		[{start: 0, end: 5, items: [{i: 3}]},
		 {start: 8, end: null, items: [{i: 15}, {i: 24}]}]
	);
});

it('should insert into an endless range 2', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: null, end: 5, items: [{i: 3}]},
			 {start: 8, end: 30, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 1, end: 2, items: [{i: 2}]},
			"i"
		),

		[{start: null, end: 5, items: [{i: 2},{i: 3}]},
		 {start: 8, end: 30, items: [{i: 13}, {i: 18}, {i: 24}]}]
	);
});

it('should insert between ranges', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 6, end: 7, items: [{i: 6}]},
			"i"
		),

		[{start: 0, end: 5, items: [{i: 3}]},
		 {start: 6, end: 7, items: [{i: 6}]},
		 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}]
	);
});

it('should extend a range forward', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 4, end: 7, items: [{i: 6}]},
			"i"
		),

		[{start: 0, end: 7, items: [{i: 3},{i: 6}]},
		 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}]
	);
});


it('should extend a range backward', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 6, end: 9, items: [{i: 6}]},
			"i"
		),

		[{start: 0, end: 5, items: [{i: 3}]},
		 {start: 6, end: null, items: [{i: 6}, {i: 13}, {i: 18}, {i: 24}]}]
	);
});


it('should merge touching ranges 1', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 5, end: 7, items: [{i: 6}]},
			"i"
		),

		[{start: 0, end: 7, items: [{i: 3},{i: 6}]},
		 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}]
	);
});

it('should merge touching ranges 2', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 5, end: 8, items: [{i: 6}]},
			"i"
		),

		[{start: 0, end: null, items: [{i: 3},{i: 6}, {i: 13}, {i: 18}, {i: 24}]}]
	);
});

it('should merge overlapping ranges', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 4, end: 15, items: [{i: 6}, {i: 9}]},
			"i"
		),

		[{start: 0, end: null, items: [{i: 3},{i: 6}, {i: 9}, {i: 18}, {i: 24}]}]
	);
});

it('should delete a point range (single item)', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 13, end: 13, items: []},
			"i"
		),

		[{start: 0, end: 5, items: [{i: 3}]},
		 {start: 8, end: null, items: [{i: 18}, {i: 24}]}]
	);
});

it('should replace a point range (single item)', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 13, end: 13, items: [{i:13, foo: 'bar'}]},
			"i"
		),

		[{start: 0, end: 5, items: [{i: 3}]},
		 {start: 8, end: null, items: [{i: 13, foo: 'bar'}, {i: 18}, {i: 24}]}]
	);
});

it('should insert a point range (single item)', function () {
	assert.deepEqual(
		rangeOps.merge(
			[{start: 0, end: 5, items: [{i: 3}]},
			 {start: 8, end: null, items: [{i: 13}, {i: 18}, {i: 24}]}],
			{start: 15, end: 15, items: [{i:15}]},
			"i"
		),

		[{start: 0, end: 5, items: [{i: 3}]},
		 {start: 8, end: null, items: [{i: 13},{i:15},{i: 18}, {i: 24}]}]
	);
});
