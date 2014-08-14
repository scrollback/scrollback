/*global describe, it*/
var assert = require('assert');
var ArrayCache = require('./ArrayCache.js');

function mkrec(it) {
	return { id: 'item-' + it, time: it };
}

function mkres(its, opt) {
	its = its.map(mkrec);
	its.unshift({
		type: 'result-start', 
		endtype: opt.aft? 'time': 'limit',
		time: opt.aft || its[0].time
	});
	its.push({type: 'result-end', 
		endtype: opt.bef? 'time': 'limit',
	 	time: opt.bef || its[its.length-1].time
	 });
	
	return its;
}

function compare (ds, its) {
	var i;
	for(i=0; i<its.length; i++) {
		if(
			!ds[i] ||
			(its[i] == '(' && (ds[i].type != 'result-start' || ds[i].endtype != 'limit')) ||
			(its[i] == ')' && (ds[i].type != 'result-end' || ds[i].endtype != 'limit')) ||
			(its[i] == '[' && (ds[i].type != 'result-start' || ds[i].endtype != 'time')) ||
			(its[i] == ']' && (ds[i].type != 'result-end' || ds[i].endtype != 'time')) ||
			(its[i] == '?' && ds[i].type != 'missing') ||
			(typeof its[i] === 'number' && its[i] !== ds[i].time)
		) {
			return false;
		}
	}
	return true;
}

var ac = new ArrayCache([]);

describe("ArrayCache", function(){
	it("should insert elements", function(){
		ac.put('time', mkres([3, 4, 5], {bef: 5}));
		assert(compare(ac.d, ['(', 3, 4, 5, ']']), "Wrong state");	
	});
	
	it("should give results with before/null/partialsOk", function() {
		var res = ac.get('time', {time: null, before: 5, partials: true});
		assert(compare(res, ['?', 3, 4, 5, '?']), 'Wrong results');
	});

	it("should return null with before/null/partialsNotOk", function() {
		var res = ac.get('time', {time: null, before: 5});
		assert(res === null, 'Wrong results');
	});
	
	it("should merge elements 1", function(){
		ac.put('time', mkres([1, 2, 3], {bef: 3}));
		assert(compare(ac.d, ['(', 1, 2, 3, 4, 5, ']']), "Wrong state");	
	});
	
	it("should merge elements 2", function(){
		ac.put('time', mkres([7, 8],{aft: 7}));
		assert(compare(ac.d, ['(', 1, 2, 3, 4, 5, ']', '[', 7, 8, ')']), "Wrong state");	
	});
	
	it("should give results with missing across a gap after/4/partialsOk", function() {
		var res = ac.get('time', {time: 4, after: 5, partials: true});
		assert(compare(res, [4, 5, '?', 7, 8]), 'Wrong results');
	});
	
	it("should return null when there is a gap after/4/partialsNotOk", function() {
		var res = ac.get('time', {time: 4, after: 5});
		assert(res === null, 'Wrong results');
	});
	
	it("should merge elements 3", function(){
		ac.put('time', mkres([5, 6, 7], {bef: 7}));
		assert(compare(ac.d, ['(', 1, 2, 3, 4, 5, 6, 7, 8, ')']), "ArrayCache.put 3 failed ");	
	});
	
	it("should return results when all elements are available after/4/partialsNotOk", function() {
		var res = ac.get('time', {time: 4, after: 5});
		assert(compare(res, [4, 5, 6, 7, 8]), 'Wrong results');
	});

});