var config = require('../config.js');
var core = new (require('../lib/emitter.js'))();
var gen = require("../lib/generate.js");
var assert = require('assert');
require('./recommendation.js')(core);
describe('Recommendation tests', function() {

	it("getRooms API: (get featured rooms)", function(done) {
		core.emit("getRooms", {featured: true}, function(err, results) {
			assert.equal(results.ref instanceof Array, true, "Should update query( ref is not an array)");
			assert.equal(results.featured, true, "Should have featured property");
			done();
		});
	});

	it("getRooms API: (don't get featured rooms)", function(done) {
		core.emit("getRooms", {ref: "scrollback"}, function(err, results) {
			assert.equal(results.ref instanceof Array, false, "Should not update query( ref is an array)");
			done();
		});
	});
});
