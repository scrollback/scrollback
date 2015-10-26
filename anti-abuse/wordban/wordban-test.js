/* jshint mocha: true */
var assert = require("assert");
var core = new (require('ebus'))();
var wordban = require("./wordban.js");
var gen = require("../../lib/generate.js");
var config = require("./../../server-config-defaults.js");
var guid = gen.uid;
var names = gen.names;
var rooms = [{
	id: "testingroom",
	type: "room",
	params: {
		antiAbuse: {
			spam: true,
			block: {
				english: true
			},
			customPhrases: [
                'abc def',
                'cde'
            ]
		}
	}
}];

var message = {
	id: guid(),
	room: rooms[0],
	text: "value : " + Math.random(),
	from: "guest-" + names(6),
	to: "testingroom",
	type: 'text',
	tags: [],
	time: new Date().getTime(),
	session: "web://sdjfkalja24aadf:dkaslkfjkjaf"
};

function copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}
describe('wordban', function() {
	before(function(done) {
		wordban(core, config);
		setTimeout(function() {
			done();
		}, 1500);
	});

	it('Message test', function(done) {
		var msg = copy(message);
		core.emit("text", msg, function(err) {
			console.log("reply:", msg, err);
			var l = msg.tags.indexOf("abusive") !== -1;
			assert.notEqual(l, true, "banning normal message");
			done();
		});

	});

	it('banned word test', function(done) {
		var msg = copy(message);
		msg.text += " fuck";
		core.emit("text", msg, function(err) {
			console.log("reply:", msg, err);
			var l = msg.tags.indexOf("abusive") !== -1;
			assert(l, true, "Not banning word fuck");
			done();
		});

	});


	it('Room banning test', function(done) {
		core.emit("room", {
			id: guid(),
			from: "testUser",
			to: "fuck",
			room: {
				id: "fuck",
				type: "room"
			}
		}, function(err) {
			console.log(err);
			assert(err, new Error("Abusive room name"), "Not banning word fuck if it is a room name");
			done();
		});
	});

	it("room saving empty custrom phrases test-1", function(done) {
		var rs = copy(rooms);
		rs[0].params.antiAbuse.customPhrases = ["abc", "", "abc cde"];
		core.emit("room", {
			id: guid(),
			to: rs[0].id,
			room: rs[0]
		}, function(e, a) {
			console.log("Reply=", a.room.params.antiAbuse);
			assert.equal(rs[0].params.antiAbuse.customPhrases.length, 2, "Not removing empty string from array");
			done();
		});
	});

	it("room saving empty custrom phrases test-2", function(done) {
		var rs = copy(rooms);
		rs[0].params.antiAbuse.customPhrases = [""];
		core.emit("room", {
			id: guid(),
			to: rs[0].id,
			room: rs[0]
		}, function() {
			console.log("Reply=", JSON.stringify(rs[0]));
			assert.equal(rs[0].params.antiAbuse.customPhrases.length, 0, "Not removing empty string from array");
			done();
		});
	});

	it("room saving", function(done) {
		var rs = copy(rooms);
		core.emit("room", {
			id: guid(),
			to: rs[0].id,
			room: rs[0]
		}, function(err, reply) {
			console.log("Reply:", err, reply);
			assert.ifError(err);
			done();
		});
	});

	it("customPhrases test - 1", function(done) {
		var msg = copy(message);
		msg.text += " cde";
		core.emit("text", msg, function(err) {
			console.log("reply:", msg, err);
			var l = msg.tags.indexOf("abusive") !== -1;
			assert(l, true, "Not banning custom word cde");
			done();
		});
	});

	it("customPhrases test - 3", function(done) {
		var msg = copy(message);
		msg.text += " abc def testing test..";
		core.emit("text", msg, function(err) {
			console.log("reply:", msg, err);
			var l = msg.tags.indexOf("abusive") !== -1;
			assert.equal(l, true, "not banning");
			done();
		});
	});

	it("customPhrases test - 4", function(done) {
		var msg = copy(message);
		msg.text += " abc testing test..";
		core.emit("text", msg, function(err) {
			console.log("reply:", msg, err);
			var l = msg.tags.indexOf("abusive") !== -1;
			assert.notEqual(l, true, "not banning");
			done();
		});
	});

	it("customPhrases test - 5", function(done) {
		var msg = copy(message);
		msg.text = ":P";
		msg.room.params.antiAbuse.customPhrases = [""];
		core.emit("text", msg, function(err, data) {
			console.log("reply:", data, err);
			var l = msg.tags.indexOf("abusive") !== -1;
			console.log(l);
			assert.equal(!!l, false, "don't match empty string");
			done();
		});
	});

});
