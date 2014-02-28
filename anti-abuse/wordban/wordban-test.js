var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var wordban = require("./wordban.js");
var guid = require("../../lib/guid.js");
var names = require("../../lib/names.js");
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "testingRoom", type: 'text', time: new Date().getTime()};

describe.only('wordban', function() {
	it('init', function(done) {
		wordban(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});
	it('banned word test', function(done) {
		msg.text += " fuck";
		core.on("getRooms", function(obj, callback) {
			console.log("rooms event");
			callback(null, {id: obj.id, params: {wordban: true}});
		});
		core.emit("text", msg, function(err, data) {
			console.log(msg, err);
			assert(err, new Error("BANNED_WORD"), "Not banning word fuck");			
			done();
		});
	});
	
});
