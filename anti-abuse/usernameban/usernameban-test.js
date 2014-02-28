var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var usernameban = require("./usernameban.js");
var guid = require("../../lib/guid.js");
var names = require("../../lib/names.js");
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "scrollback", type: 'text', time: new Date().getTime()};

describe.only('usernameban', function() {
	it('init', function(done) {
		usernameban(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});
	it('Username ban test.', function(done) {
		msg.from = "rrrrr";
		core.emit("text", msg, function(err, data) {
			console.log(msg, err);
			assert(err, new Error("BANNED_USERNAME"), "Not banning user 'rrrrr'");			
			done();
		});
	});
	
});
