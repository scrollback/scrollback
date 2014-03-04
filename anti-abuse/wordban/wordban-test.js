var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var wordban = require("./wordban.js");
var guid = require("../../lib/guid.js");
var names = require("../../lib/names.js");
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "testingRoom", type: 'text', time: new Date().getTime(), session: "web://sdjfkalja24aadf:dkaslkfjkjaf"};

describe('wordban', function() {
	it('init', function(done) {
		wordban(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});
	it('banned word test', function(done) {
		msg.text += " fuck";
		core.on("getRooms", function(obj, callback) {//add with query obj
			console.log("rooms event");
			obj.results = [{id: "scrollback", from: "testUser", time: new Date().getTime(), room:{id: obj.id, params: {wordban: true}}}];
			callback();
		});
		core.emit("text", msg, function(err, data) {

			console.log(msg, err);
			var l = msg.labels.abusive;
			assert(l, 1, "Not banning word fuck");
			done();
		});
	});


	it('Room banning test', function(done) {
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



	
});
