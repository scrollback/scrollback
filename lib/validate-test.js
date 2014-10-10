var validate = require("./validate.js");
var assert = require("assert");


describe('validate test', function() {
	it('room length', function() {
		assert.equal(validate("ha"),false,"2 char is allowed");
		assert.equal(validate("h"),false,"1 char is allowed");
		assert.equal(validate("har"),true,"3 char is not allowed");
		assert.equal(validate("h234567890123456789012345678901"),true,"less than 32 bu still invalid");
		assert.equal(validate("h2345678901234567890123456789012"),true,"less than 32 bu still invalid");
		assert.equal(validate("h23456789012345678901234567890123"),false,"33 but says valid");
		assert.equal(validate("h234567890123456789012345678901234"),false,"34 but say valid");
	});

	it('special charaters', function() {
		assert.equal(validate("har!"),false,"has special char");
		assert.equal(validate("!harry"),false,"has special char");
		assert.equal(validate("ha!"),false,"has special char");
		assert.equal(validate("ha!sdfascniadf"),false,"has special char");
		assert.equal(validate("harish"),true,"has special char");
	});
	it('reserved words', function() {
		assert.equal(validate("sdk"),false,"reserved char allowed");
		assert.equal(validate("css"),false,"reserved char allowed");
		assert.equal(validate("img"),false,"reserved char allowed");
		assert.equal(validate("img1"),true,"reserved char allowed");
	});

	it('room name with number', function() {
		assert.equal(validate("1ha"),true, "Starting with number.");
		assert.equal(validate("1345678"),false,"only Number");
		assert.equal(validate("1345678hhhhhhh", true), "1345678hhhhhhh","Invalid sanitized value");
		assert.equal(validate("111111", true),"scrollback", "Invalid sanitized value");
	});
});
	
