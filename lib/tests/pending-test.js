"use strict";
/* jshint mocha: true */
var pending = require('../pending.js');
var assert = require('assert');
describe("Pending Test.", function() {
	it("Generate key for getUsers with ref", function() {
		var x = pending.generateKey({
			type: "getUsers",
			ref: "alice"
		});
		assert.equal(x, "getUsers/alice");
	});

	it("Generate key for getRooms with ref", function() {
		var x = pending.generateKey({
			type: "getRooms",
			ref: "scrollback"
		});
		assert.equal(x, "getRooms/scrollback");
	});
	
	it("Generate key for getRooms hasMember ", function() {
		var x = pending.generateKey({
			type: "getRooms",
			hasMember: "alice"
		});
		assert.equal(x, "alice/hasMember");
	});
	
	it("Generate key for getRooms hasOccupant", function() {
		var x = pending.generateKey({
			type: "getRooms",
			hasOccupant: "alice"
		});
		assert.equal(x, "alice/hasOccupant");
	});
	
	it("Generate key for getUsers memberOf ", function() {
		var x = pending.generateKey({
			type: "getUsers",
			memberOf: "scrollback"
		});
		assert.equal(x, "scrollback/memberOf");
	});
	
	it("Generate key for getUsers occupantOf ", function() {
		var x = pending.generateKey({
			type: "getRooms",
			occupantOf: "scrollback"
		});
		assert.equal(x, "scrollback/occupantOf");
	});

	
	it("Generate key for getTexts to time ", function() {
		var x = pending.generateKey({
			type: "getTexts",
			to: "scrollback",
			time: null,
			before: 50
		});
		assert.equal(x, "scrollback/getTexts/before");
	});

});
