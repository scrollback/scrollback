var assert = require("assert");
var core = require("../test/mock-core.js")();
var gen = require("../lib/generate.js")
var search = require("./search.js")
var guid = 	gen.uid;
var names = gen.names;
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "testingRoom", type: 'text', time: new Date().getTime(), session: "web://sdjfkalja24aadf:dkaslkfjkjaf"};

describe('search', function() {
	beforeEach (function(done) {
		search(core);
		setTimeout(done,1500);
	});
	it('search index test', function(done) {
		msg.text += " fuck";
		core.emit("text", msg, function(err, data) {
			console.log(msg, err);
			assert.ok(!err, " Error occured in indexing ");
			done();
		});
	});


	/*it('Room banning test', function(done) {
		core.emit("room",{
			id: guid(),
			from: "testUser",
			to: "fuck",
			room: {
				id: "fuck",
				type: "room"
			}

		}, function(err, room) {
			console.log(err);
			assert(err, new Error("Abusive room name"), "Not banning word fuck if it is a room name");
			done();
		});
	});
*/
});