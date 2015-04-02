/* jshint mocha: true */
var core = new (require('ebus'))();
var assert = require('assert');
var config = require('../server-config-defaults.js');
require('./featured.js')(core, config.featured);
describe('Featured tests', function() {

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
