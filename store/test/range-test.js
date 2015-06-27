/* global describe, it */

var rangeOps = require("../../lib/range-ops.js"),
	assert = require('assert');


describe('getItems', function () {
	it('should get tween+before in the middle', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 21, before: 3},
				"i"
			),
			[{i: 13}, {i: 18}, {i: 20}]
		);
	});
	it('should get tween+after in the middle', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 11, after: 3},
				"i"
			),
			[{i: 13}, {i: 18}, {i: 20}]
		);
	});
	it('should get tween+before+after in the middle', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 15, before: 1, after: 2},
				"i"
			),
			[{i: 13}, {i: 18}, {i: 20}]
		);
	});
	it('should get exact+before in the middle', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 20, before: 3},
				"i"
			),
			[{i: 13}, {i: 18}, {i: 20}]
		);
	});
	it('should get exact+after in the middle', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 13, after: 3},
				"i"
			),
			[{i: 13}, {i: 18}, {i: 20}]
		);
	});
	it('should get exact+before+after in the middle', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 18, before: 1, after: 2},
				"i"
			),
			[{i: 13}, {i: 18}, {i: 20}]
		);
	});
	it('should get after at items boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 3, after: 3},
				"i"
			),
			[{i: 3}, {i: 13}, {i: 18}]
		);
	});
	it('should get before at items boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 24, before: 3},
				"i"
			),
			[{i: 18}, {i: 20}, {i: 24}]
		);
	});
	
	it('should get after at range boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 0, after: 3},
				"i"
			),
			[{i: 3}, {i: 13}, {i: 18}]
		);
	});
	it('should get before at range boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 25, before: 3},
				"i"
			),
			[{i: 18}, {i: 20}, {i: 24}]
		);
	});
	
	it('should get after at range+items boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 0}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 0, after: 3},
				"i"
			),
			[{i: 0}, {i: 13}, {i: 18}]
		);
	});
	it('should get before at range+items boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 25}]}],
				{i: 25, before: 3},
				"i"
			),
			[{i: 18}, {i: 20}, {i: 25}]
		);
	});
	
	it('should get after at range+items boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 0}, {i: 13}, {i: 18}, {i: 20}, {i: 24}]}],
				{i: 0, after: 3},
				"i"
			),
			[{i: 0}, {i: 13}, {i: 18}]
		);
	});
	it('should get before at range+items boundary', function () {
		assert.deepEqual(
			rangeOps.getItems(
				[{start: 0, end: 25, items: [{i: 3}, {i: 13}, {i: 18}, {i: 20}, {i: 25}]}],
				{i: 25, before: 3},
				"i"
			),
			[{i: 18}, {i: 20}, {i: 25}]
		);
	});
	
	/* todo: add tests for start/end=null, ranges that overlap or are beyond the boundaries */
});

describe('merge', function () {
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
});