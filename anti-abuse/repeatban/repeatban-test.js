var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var repeatban = require("./repeatban.js");
var gen = require("../../lib/generate.js")
var guid = 	gen.uid;
var names = gen.names;
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "scrollback", type: 'text', time: new Date().getTime()};

describe('usernameban', function() {
	beforeEach( function(done) {
		repeatban(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});
	//sending same message 4 time...
	it('Repeate ban test.', function(done) {
		core.emit("text", msg, function(err, data) {
			core.emit("text", msg, function(err, data) {
				core.emit("text", msg, function(err, data) {
					core.emit("text", msg, function(err4, data) {
						console.log(msg, err4);
						assert(err4, new Error("REPEATATIVE"), "Repeatative detection is not working");			
						done();
					});
				});
			});
		});
	});
	
});
