var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var originban = require("./originban.js");
var gen = require("../../lib/generate.js")
var guid = 	gen.uid;
var names = gen.names;
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "scrollback", type: 'text', time: new Date().getTime()};

describe('usernameban', function() {
	beforeEach( function(done) {
		originban(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});
	it('Origin ban Test.', function(done) {
		msg.origin = "web://scrollback.io";
		core.emit("text", msg, function(err, data) {
			console.log(msg, err);
			assert(!err, true, "banned Origin");			
			done();
		});
	});
	
});
