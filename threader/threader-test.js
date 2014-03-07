var assert = require("assert");
var config  = require('../config.js');
var core = require("../test/mock-core.js")();
var threader = require("./threader.js");
var guid = require("../lib/guid.js");
var names = require("../lib/names.js");
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "scrollback", type: 'text', time: new Date().getTime()};

describe.only('threader', function() {
	it('init', function(done) {
		threader(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});
	it('should get a label with title', function(done) {
		core.emit("text", msg, function(err, data) {
			console.log(msg);
			var m = msg.labels  &&  typeof msg.labels === 'object' ? true : false;
			assert.equal(m, true, "Unable to get a label for message OR typeof labels is not Object.");
			done();
		});
	});
	
});

/**
 *1. Max callback wait should be 1 sec.
 */