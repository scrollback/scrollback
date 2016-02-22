/* eslint-env mocha */

"use strict";

var Validator = require("./validator.js"),
	assert = require("assert");

describe("validator test", function() {
	it("should contain error", function() {
		assert.equal(new Validator("barry").error, null);
		assert.equal(new Validator(123).error, "ERR_VALIDATE_TYPE");
		assert.equal(new Validator("").error, "ERR_VALIDATE_EMPTY");
		assert.equal(new Validator("!abc").error, "ERR_VALIDATE_CHARS");
		assert.equal(new Validator("-abc").error, "ERR_VALIDATE_START");
		assert.equal(new Validator("123").error, "ERR_VALIDATE_NO_ONLY_NUMS");
	});

	it("should give error string", function() {
		assert.equal(new Validator("barry").getErrorString(), "");
		assert.equal(!!(new Validator(123).error), true);
		assert.equal(typeof (new Validator("").error) === "string", true);
		assert.equal(typeof (new Validator("!abc").error) === "string", true);
		assert.equal(typeof (new Validator("-abc").error) === "string", true);
		assert.equal(typeof (new Validator("123").error) === "string", true);
	});

	it("should validate room length", function() {
		assert.equal(new Validator("ha").isValid(), false, "2 char is allowed");
		assert.equal(new Validator("h").isValid(), false, "1 char is allowed");
		assert.equal(new Validator("har").isValid(), true, "3 char is not allowed");
		assert.equal(new Validator("h234567890123456789012345678901").isValid(), true, "less than 32 bu still invalid");
		assert.equal(new Validator("h2345678901234567890123456789012").isValid(), true, "less than 32 bu still invalid");
		assert.equal(new Validator("h23456789012345678901234567890123").isValid(), false, "33 but says valid");
		assert.equal(new Validator("h234567890123456789012345678901234").isValid(), false, "34 but say valid");
	});

	it("should validate reserved words", function() {
		assert.equal(new Validator("sdk").isValid(), false, "reserved char allowed");
		assert.equal(new Validator("css").isValid(), false, "reserved char allowed");
		assert.equal(new Validator("img").isValid(), false, "reserved char allowed");
		assert.equal(new Validator("img1").isValid(), true, "reserved char allowed");
	});

	it("should validate special charaters", function() {
		assert.equal(new Validator("har!").isValid(), false, "has special char");
		assert.equal(new Validator("!harry").isValid(), false, "has special char");
		assert.equal(new Validator("ha!").isValid(), false, "has special char");
		assert.equal(new Validator("ha!sdfascniadf").isValid(), false, "has special char");
		assert.equal(new Validator("hasdf@ascni.adf").isValid(), false, "has special char");
		assert.equal(new Validator("harish").isValid(), true, "has special char");
	});

	it("should validate room name with number", function() {
		assert.equal(new Validator("1ha").isValid(), true, "Starting with number.");
		assert.equal(new Validator("1345678").isValid(), false, "only Number");
	});

	it("should sanitize", function() {
		assert.equal(new Validator("1345678hhhhhhh").sanitize(), "1345678hhhhhhh", "Invalid sanitized value");
		assert.equal(new Validator("111111").sanitize({ defaultName: "scrollback" }), "scrollback", "Invalid sanitized value");
	});
});
