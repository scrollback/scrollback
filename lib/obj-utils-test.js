/* eslint-env mocha */
/* eslint-disable no-undefined */

"use strict";

var objUtils = require("./obj-utils.js"),
	clone = objUtils.clone,
	get = objUtils.get,
	merge = objUtils.merge,
	deepFreeze = objUtils.deepFreeze,
	assert = require("assert"),
	obj = {
		design: {
			tools: [ "paper", "sketch", "photoshop" ],
			colors: {
				warm: [ "yellow", "orange", "red" ],
				cold: "blue"
			},
			days: [
				{ weekdays: false, weekends: true },
				{ holidays: true }
			],
			period: "allnight"
		},
		code: {
			tools: "sublime",
			juice: null,
			time: undefined
		}
	};

describe("clone", function() {
	it("shouldn't be a reference", function() {
		assert.notEqual(clone(obj), obj, "objects are the same");
	});

	it("should have same contents", function() {
		assert.deepEqual(clone(obj), obj, "objects have different contents");
	});

});

describe("get", function() {
	it("should return correct object", function() {
		assert.deepEqual(get(obj, "design", "colors"), obj.design.colors, "objects have different contents");
	});

	it("should return correct array", function() {
		assert.deepEqual(get(obj, "design", "tools"), obj.design.tools, "arrays have different contents");
	});

	it("value is a string in an object", function() {
		assert.equal(get(obj, "code", "tools"), obj.code.tools, "values don't match");
	});

	it("value is a string in an array", function() {
		assert.equal(get(obj, "design", "colors", "warm", 1), obj.design.colors.warm[1], "values don't match");
	});

	it("value is a boolean in an object inside array", function() {
		assert.equal(get(obj, "design", "days", 0, "weekends"), obj.design.days[0].weekends, "values don't match");
	});

	it("should return 'undefined' if value doesn't exist", function() {
		assert.equal(typeof get(obj, "design", "nonexistent", "property"), "undefined", "value is defined");
	});
});

describe("equal", function() {
	it("should ignore key order", function() {
		assert(objUtils.equal({a: 3, b:"hello", c: null}, {a: 3, c: null, b:"hello"}));
	});

	it("should not check null vs undefined", function() {
		assert(!objUtils.equal({a: 3, b:"hello", c: null}, {a: 3, c: undefined, b:"hello"}));
	});

	it("should equal empty objects", function() {
		assert(objUtils.equal({}, {}));
	});

	it("should not type cast values", function() {
		assert(!objUtils.equal({a: 3}, {a: "3"}));
	});

	it("should not equalize objects", function() {
		assert(!objUtils.equal({foo: {a: 3, b:"hello", c: null}, bar: undefined}, {foo: {a: 3, b:"hello", c: null}, bar: undefined}));
	});

	it("should deep equalize objects", function() {
		assert(objUtils.deepEqual({foo: {a: 3, b:"hello", c: null}, bar: undefined}, {foo: {a: 3, b:"hello", c: null}, bar: undefined}));
	});
});

describe("merge", function() {
	it("should merge objects onto first one", function() {
		var o1 = { a: { red: "orange" }, b: 3, c: { d: "world", f: "universe" } },
			o2 = { a: "hello", c: { d: "earth", e: "mars" } };

		assert.equal(merge(o1, o2), o1);
		assert.deepEqual(merge(o1, o2), { a: "hello", b: 3, c: { d: "earth", e: "mars", f: "universe" } });
	});

	it("should not merge arrays", function() {
		var o1 = { a: [ 1, 2, 3 ] },
			o2 = { a: [ "a", "b", "c" ] };

		assert.equal(merge(o1, o2), o1);
		assert.deepEqual(merge(o1, o2), { a: [ "a", "b", "c" ] });
	});
});

describe("deepFreeze", function() {
	it("should freeze the given object", function() {
		var o = { a: "apple", b: "blue", grass: { num: "123", green: { planet: "earth" } } };

		deepFreeze(o);

		assert.ok(Object.isFrozen(o), "object is not frozen");
		assert.ok((Object.isFrozen(o.grass) && Object.isFrozen(o.grass.green)), "object properties are not frozen");
	});

	it("should not be able to change the value", function() {
		var o = { a: "apple", b: "blue", grass: { num: "123", green: { planet: "earth" } } };

		deepFreeze(o);

		assert.throws(function() {
			o.grass.green = "red";
		}, "object value was set without error");
		assert.notEqual(o.grass.green, "red", "object value was changed");
	});

});
