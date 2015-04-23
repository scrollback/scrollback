/* jshint mocha: true */

var objUtils = require("./obj-utils.js"),
	clone = objUtils.clone,
	get = objUtils.get,
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

describe("deepFreeze", function() {
	it("should freeze the given object", function() {
		var obj = { a: "apple", b: "blue", grass: { num: "123", green: { planet: "earth" } } };

		deepFreeze(obj);

		assert.ok(Object.isFrozen(obj), "object is not frozen");
		assert.ok((Object.isFrozen(obj.grass) && Object.isFrozen(obj.grass.green)), "object properties are not frozen");
	});

	it("should not be able to change the value", function() {
		var obj = { a: "apple", b: "blue", grass: { num: "123", green: { planet: "earth" } } };

		deepFreeze(obj);

		obj.grass.green = "red";

		assert.notEqual(obj.grass.green, "red", "object value was changed");
	});

});
