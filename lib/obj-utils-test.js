/* jshint mocha: true */

var objUtils = require("./obj-utils.js"),
	clone = objUtils.clone,
	get = objUtils.get,
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
			period: "allnight",
		},
		code: {
			tools: "sublime",
			juice: null,
			time: undefined
		}
	};


describe("clone given object", function() {
	it("shouldn't be a reference", function() {
		assert.notEqual(clone(obj), obj, "objects are the same");
	});

	it("should have same contents", function() {
		assert.deepEqual(clone(obj), obj, "objects have different contents");
	});

});


describe("get key from object", function() {
	it("should return a clone of object", function() {
		assert.notEqual(get(obj, "design", "colors"), obj.design.colors, "objects are the same");
		assert.deepEqual(get(obj, "design", "colors"), obj.design.colors, "objects have different contents");
	});

	it("should return a clone of array", function() {
		assert.notEqual(get(obj, "design", "tools"), obj.design.tools, "arrays are the same");
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
