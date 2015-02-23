var assert = require("assert");
var config  = require('../../config.js');
var suffixArray = require('./suffixArray.js');
var search = require('./searchPattern.js')
describe('Suffix Array test.', function() {
	it("search pattern test-1", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "is");
		console.log(r);
		assert.equal(r, 2, "wrong index");
	});
	
	it("search pattern test-2", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "this");
		console.log(r);
		assert.equal(r, 0, "wrong index");
	});
	
	it("search pattern test-3", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "xt");
		console.log(r);
		assert.equal(r, 8, "wrong index");
		
	});
    
    
    it("search pattern test-4", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "xt");
		console.log(r);
		assert.equal(r, 8, "wrong index");
		
	});
    
    
    it("search pattern test-5", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "xte");
		console.log(r);
		assert.equal(r, -1, "wrong index");
		
	});
    
    it("search pattern test-6", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "thes");
		console.log(r);
		assert.equal(r, -1, "wrong index");
		
	});
    
     it("search pattern test-7", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "t");
		console.log(r);
         var b = (r === 6) || (r === 0);
		assert.equal(b, true, "wrong index")
		
	});
    
    it("search pattern test-8", function() {
		var array = suffixArray("thisistext");
        var r = search("thisistext", array, "thisistext");
		console.log(r);
		assert.equal(r, 0, "wrong index");
		
	});
    
    it("search pattern test-9", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "thissitext");
		console.log(r);
		assert.equal(r, -1, "wrong index");
		
	});
    
    it("search pattern test-10", function() {
		var array = suffixArray("thisistext");
		var r = search("thisistext", array, "tex");
		console.log(r);
		assert.equal(r, 6, "wrong index");
	});
    
});
