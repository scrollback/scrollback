/* jshint mocha: true */
var rangeOps = require("../range-ops.js");
console.log(rangeOps);
describe("Merge text.", function() {
	it("Generate 100 random uid", function(done) {
        var t = new Date().getTime() - 10000, start = t;
        var items = createTexts(start, 0, 100);
        var ranges = [];
        var range1 = {
            start: start,
            end: items[items.length -1].time,
            items: items
        };
        ranges.push(range1);
        
        start = t + 100;
        items = createTexts(start, 0, 100);
        var range2 = {
            start: start,
            end: items[items.length -1].time,
            items: items
        };
        ranges.push(range2);
        
        start = start + 150;
        items = createTexts(start, 0, 100);
        range2 = {
            start: start,
            end: items[items.length -1].time + 1,
            items: items
        };
        
//        var merged = rangeOps.merge(ranges, );
	   done();
	});
});



function createTexts(start, end, count) {
    var i, time = start || end, multi = start? 1: -1;
    var res = [], action;
    
    for(i = 0; i<count; i++) {
        res.push(action = {
            text: "text" + i,
            time: time + (multi * (count - i))
        });
    }
    
    return res;
}
