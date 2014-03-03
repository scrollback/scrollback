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
	it('should get a thread with title', function(done) {
		core.emit("text", msg, function(err, data) {
			console.log(msg);
			var m = msg.threads  &&  typeof msg.threads === 'object' && msg.threads.length > 0 ? true : false;
            m = m && (msg.threads[0].id && msg.threads[0].title && msg.threads[0].score ? true : false);
			assert.equal(m, true, "Unable to get a label for message OR typeof labels is not an array.");
			done();
		});
	});
});

/**
 *1. Max callback wait should be 1 sec.
 */