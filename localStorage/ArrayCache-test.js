/*global describe, it*/
var assert = require('assert');
var ArrayCache = require('./ArrayCache.js');

var testArr = new ArrayCache([]);

describe("Testing ArrayCache localStorage", function(){
	it("Inserting elements ", function(){
		testArr.put([{type: 'result-start', time: 1}, {time:2}, {time:5}, {time:6}, {time:7}, {time:8},{type: 'result-end', time: 9}]);
		console.log("Put into empty array succeeded! ");
	});
	
	it("Testing merge ", function(){
		testArr.put([{type: 'result-start', time: 2}, {time: 3}, {time: 4}, {type: 'result-end', time: 5}]);
		
		var items = testArr.getItems();
		var flag = true;
		
		for(var i=0; i<items.length; i++){
			if(items[i].time !== i+1){
				flag = false;
				break;
			}
		}
		assert.equal(flag, true, "ArrayCache.put failed ");	
		 
	});
	
	it("Testing after query ", function(){
		var results = testArr.get({time: 6, after: 2});
		// check results
		var flag = false;
		if(results[0] && results[0].time === 6 && results[1] && results[1].time === 7) flag = true;
		assert.equal(flag, true, "Query with after param failed");
	});
	
	it("Testing before query ", function(){
		var results = testArr.get({time: 8, before: 2});
		// check results
		var flag = false;
		if(results[0] && results[0].time === 6 && results[1] && results[1].time === 7) flag = true;
		assert.equal(flag, true, "Query with before param failed");
	});
	
	it("Testing before + after query ", function(){
		var results = testArr.get({time: 7, before: 2, after: 2});
		var flag = false;
		if(results[0] && results[0].time === 6 && results[1] && results[1].time === 7 && results[2] && results[2].time === 8) flag = true;
		assert.equal(flag, true, "Query with before and after params failed");
	});
	
});