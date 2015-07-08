/* eslint-env mocha */

"use strict";

var assert = require("assert"),
	group = require("./group-objects.js");

describe("group objects test", function() {
	it("should group objects", function() {
		var objs = [
				{ value: "hello", group: "a" },
				{ value: "jazzy", group: "a", count: 3 },
				{ value: "fuzzy", group: "a", count: 2 },
				{ value: "muzzy", group: "b", count: 0 },
				{ value: "whizz", group: "b", count: 4 },
				{ value: "fezzy", group: "c", count: 1 },
				{ value: "fizzy", group: "c", count: 2 },
				{ value: "abuzz", group: "c", count: 3 },
				{ value: "zuzim", group: "c", count: 3 },
				{ value: "scuzz", group: "c", count: 1 },
				{ value: "dizzy", group: "d", count: 1 },
				{ value: "world", group: "d", count: 2 }
			];

		assert.deepEqual(group(objs, 3), [
			{ value: 'fuzzy', group: 'a', count: 6 },
			{ value: 'whizz', group: 'b', count: 5 },
			{ value: 'scuzz', group: 'c', count: 10 },
			{ value: 'dizzy', group: 'd', count: 1 },
			{ value: 'world', group: 'd', count: 2 }
		]);
	});
	it("should return new array", function() {
		var objs = [
				{ value: "hello", group: "a" },
				{ value: "jazzy", group: "a", count: 3 },
				{ value: "fuzzy", group: "a", count: 2 },
				{ value: "muzzy", group: "b", count: 0 },
				{ value: "whizz", group: "b", count: 4 }
			];

		assert.notEqual(group(objs, 3), objs);
	});
	it("should modify given array", function() {
		var objs = [
				{ value: "hello", group: "a" },
				{ value: "jazzy", group: "a", count: 3 },
				{ value: "fuzzy", group: "a", count: 2 },
				{ value: "muzzy", group: "b", count: 0 },
				{ value: "whizz", group: "b", count: 4 }
			],
			base = [];

		assert.notEqual(group(objs, 3, base), []);
	});
	it("should clone objects with count changed", function() {
		var o1 = { value: "jazzy", group: "a", count: 1 },
			o2 = { value: "fuzzy", group: "a", count: 4 },
			o3 = { value: "muzzy", group: "b", count: 4 },
			grouped = group([ o1, o2, o3 ], 3);

		assert.notEqual(grouped[0], o2);
		assert.equal(grouped[1], o3);
	});
});
