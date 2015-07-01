/* jshint mocha: true*/
/* global modules */

var rangeOps = require("../../lib/range-ops.js");
var assert = require('assert');
//var core, config, store;
//module.exports = function(c, conf, s) {
//	core = c;
//	config = conf;
//	store = s;
	describe("Merge text.", function() {
		it("pushing range at end", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;

			range1 = createRange(start, 100, 1);
			ranges.push(range1);

			start += 100;
			range2 = createRange(start, 100, 1);
			ranges.push(range2);

			start += 150;
			range3 = createRange(start, 100, 1);
			merged = rangeOps.merge(ranges, range3, "time");
			console.log(merged);
			assert.equal(merged.length, 3, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range1.end, "Invalid Result");
			assert.equal(merged[1].start, range2.start, "Invalid Result");
			assert.equal(merged[1].end, range2.end, "Invalid Result");
			assert.equal(merged[2].start, range3.start, "Invalid Result");
			assert.equal(merged[2].end, range3.end, "Invalid Result");
		   done();
		});

		it("pushing range at middle", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;

			range1 = createRange(start, 100);
			ranges.push(range1);

			start += 100;
			console.log("To merge");
			range2 = createRange(start, 100);

			start += 150;
			range3 = createRange(start, 100);
			ranges.push(range3);
			merged = rangeOps.merge(ranges, range2, "time");
			assert.equal(merged.length, 3, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range1.end, "Invalid Result");
			assert.equal(merged[1].start, range2.start, "Invalid Result");
			assert.equal(merged[1].end, range2.end, "Invalid Result");
			assert.equal(merged[2].start, range3.start, "Invalid Result");
			assert.equal(merged[2].end, range3.end, "Invalid Result");
		   done();
		});

		it("pushing range at begin", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;
			console.log("To merge");
			range1 = createRange(start, 100);

			start += 100;
			range2 = createRange(start, 100);
			ranges.push(range2);
			start += 150;
			range3 = createRange(start, 100);
			ranges.push(range3);
			merged = rangeOps.merge(ranges, range1, "time");
			assert.equal(merged.length, 3, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range1.end, "Invalid Result");
			assert.equal(merged[1].start, range2.start, "Invalid Result");
			assert.equal(merged[1].end, range2.end, "Invalid Result");
			assert.equal(merged[2].start, range3.start, "Invalid Result");
			assert.equal(merged[2].end, range3.end, "Invalid Result");
		   done();
		});



		it("Merging range at begin", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;
			console.log("To merge");
			range1 = createRange(start, 100, 1);
			start += 50;
			range2 = createRange(start, 100, 1);
			ranges.push(range2);
			start += 250;
			range3 = createRange(start, 100, 1);
			ranges.push(range3);

			merged = rangeOps.merge(ranges, range1, "time");
			console.log(merged);
			assert.equal(merged.length, 2, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range2.end, "Invalid Result");
			assert.equal(merged[1].start, range3.start, "Invalid Result");
			assert.equal(merged[1].end, range3.end, "Invalid Result");
		   done();
		});
		it("Merging range at middle", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;

			range1 = createRange(start, 100);
			ranges.push(range1);
			start += 50;
			console.log("To merge");
			range2 = createRange(start, 100);
			start += 150;
			range3 = createRange(start, 100);
			ranges.push(range3);

			merged = rangeOps.merge(ranges, range2, "time");

			assert.equal(merged.length, 2, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range2.end, "Invalid Result");
			assert.equal(merged[1].start, range3.start, "Invalid Result");
			assert.equal(merged[1].end, range3.end, "Invalid Result");
		   done();
		});
		it("Merging range at end", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;

			range1 = createRange(start, 100);
			ranges.push(range1);
			start += 100;
			range2 = createRange(start, 100);
			ranges.push(range2);
			start += 50;
			console.log("To merge");
			range3 = createRange(start, 100);

			merged = rangeOps.merge(ranges, range3, "time");

			assert.equal(merged.length, 2, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range1.end, "Invalid Result");
			assert.equal(merged[1].start, range2.start, "Invalid Result");
			assert.equal(merged[1].end, range3.end, "Invalid Result");
		   done();
		});


		it("Merging range at middle with two", function(done) {
			var t = new Date().getTime() - 10000, start = t, merged;
			var ranges = [];
			var range1, range2, range3;

			range1 = createRange(start, 100);
			ranges.push(range1);
			start += 80;
			console.log("To merge");
			range2 = createRange(start, 100);
			start += 80;
			range3 = createRange(start, 100);
			ranges.push(range3);
			merged = rangeOps.merge(ranges, range2, "time");

			assert.equal(merged.length, 1, "Invalid Result");
			assert.equal(merged[0].start, range1.start, "Invalid Result");
			assert.equal(merged[0].end, range3.end, "Invalid Result");
			done();
		});
	});
//};
function createTexts(start, count) {
    var i, time = start;
    var res = [];

    for(i = 0; i<count; i++) {
        res.push({
            text: "text" + i,
            time: time + i
        });
    }
    return res;
}


function createRange(start, count, log){
	var range;
	var items = createTexts(start, count);
	range = {
		start: start,
		end: items[items.length -1].time,
		items: items
	};
	if (log) console.log("Range:",start, range.end);
	return range;
}



