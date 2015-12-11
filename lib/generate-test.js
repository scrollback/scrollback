/* eslint-env mocha */
var generate = require('./generate.js');
var assert = require('assert');
describe("Generate Test.", function() {
	
	it("Generate 100 random uid", function(done) {
		for (var i = 0;i < 100;i++) {
			//console.log(i, generate.uid(i).length, generate.uid(i));
			assert.equal(i, generate.uid(i).length, "Length is not same" );
		}
		done();
	});

	it("Generate: default", function(done) {
		assert.equal(32, generate.uid().length, "Length is not 32" );
		done();
	});
	
});
