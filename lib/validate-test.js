/* global describe, it */

var validate = require("./validate.js"),
	assert = require("assert");

describe('validate test', function() {
	it('room length', function() {
		assert.equal(validate("ha").isValid, false, "2 char is allowed");
		assert.equal(validate("h").isValid, false, "1 char is allowed");
		assert.equal(validate("har").isValid, true, "3 char is not allowed");
		assert.equal(validate("h234567890123456789012345678901").isValid, true, "less than 32 bu still invalid");
		assert.equal(validate("h2345678901234567890123456789012").isValid, true, "less than 32 bu still invalid");
		assert.equal(validate("h23456789012345678901234567890123").isValid, false, "33 but says valid");
		assert.equal(validate("h234567890123456789012345678901234").isValid, false, "34 but say valid");
	});

	it('reserved words', function() {
		assert.equal(validate("sdk").isValid, false, "reserved char allowed");
		assert.equal(validate("css").isValid, false, "reserved char allowed");
		assert.equal(validate("img").isValid, false, "reserved char allowed");
		assert.equal(validate("img1").isValid, true, "reserved char allowed");
	});

	it('special charaters', function() {
		assert.equal(validate("har!").isValid, false, "has special char");
		assert.equal(validate("!harry").isValid, false, "has special char");
		assert.equal(validate("ha!").isValid, false, "has special char");
		assert.equal(validate("ha!sdfascniadf").isValid, false, "has special char");
		assert.equal(validate("harish").isValid, true, "has special char");
	});

	it('room name with number', function() {
		assert.equal(validate("1ha").isValid, true, "Starting with number.");
		assert.equal(validate("1345678").isValid, false, "only Number");
		assert.equal(validate("1345678hhhhhhh").sanitized, "1345678hhhhhhh", "Invalid sanitized value");
		assert.equal(validate("111111").sanitized, "scrollback", "Invalid sanitized value");
	});
});