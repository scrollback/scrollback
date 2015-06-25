/* eslint-env mocha */

"use strict";

var TempMap = require("./temp-map.js"),
	assert = require("assert");

describe("TempMap test", function() {
	it("should not create without time", function() {
		assert.throws(function() {
			/* eslint-disable no-new */
			new TempMap();
		}, /Invalid value used as expire time/);
	});

	it("should set value", function() {
		var map = new TempMap(50),
			key = { a: "b" },
			value = [ 1, 2, 3 ];

		map.set(key, value);

		assert.equal(map.has(key), true);
	});

	it("should add key only once", function() {
		var map = new TempMap(50),
			key = { a: "b" },
			value = [ 1, 2, 3 ];

		map.set(key, value);
		map.set(key, value);
		map.delete(key);

		assert.equal(map.has(key), false);
	});

	it("should get value", function() {
		var map = new TempMap(10),
			key = { a: "b" },
			value = [ 1, 2, 3 ];

		map.set(key, value);

		assert.equal(map.get(key), value);
	});

	it("should delete value", function() {
		var map = new TempMap(10),
			key = { a: "b" },
			value = [ 1, 2, 3 ];

		map.set(key, value);
		map.delete(key);

		assert.equal(map.has(key), false);
	});

	it("should expire value", function(done) {
		var map = new TempMap(10),
			key = { a: "b" },
			value = [ 1, 2, 3 ];

		map.set(key, value);

		setTimeout(function() {
			assert.equal(map.has(key), false);
			done();
		}, 20);
	});

	it("should not expire value before time", function(done) {
		var map = new TempMap(50),
			key = { a: "b" },
			value = [ 1, 2, 3 ];

		map.set(key, value);

		setTimeout(function() {
			assert.equal(map.has(key), true);
			done();
		}, 10);
	});
});
