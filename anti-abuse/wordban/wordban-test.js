var assert = require("assert");
var config  = require('../../config.js');
var core = new (require('../../lib/emitter.js'))();
var wordban = require("./wordban.js");
var gen = require("../../lib/generate.js")
var guid = 	gen.uid;
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
}]
var msg = {
    id:guid(),room: rooms[0] ,
    text: "value : " + Math.random(),
    from : "guest-" + names(6),
    to: "testingroom",
    type: 'text',
    labels: {},
    time: new Date().getTime(),
    session: "web://sdjfkalja24aadf:dkaslkfjkjaf"
};

describe('wordban', function() {
	before(function(done) {
		wordban(core);
		setTimeout(function(){
			done();	
		}, 1500);
	});

    it('Message test', function(done) {
		core.emit("text", msg, function(err, data) {
			console.log("reply:", msg, err);
			var l = msg.labels.abusive;
			assert.notEqual(l, 1, "banning normal message");
            done();
		});

	});

	it('banned word test', function(done) {
		var t = msg.text;
        msg.text += " fuck";
		core.emit("text", msg, function(err, data) {
			console.log("reply:", msg, err);
			var l = msg.labels.abusive;
			assert(l, 1, "Not banning word fuck");
			delete msg.labels.abusive;
            msg.text = t;
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

    it("room saving", function(done) {
        core.emit("room", {id: guid(), to: rooms[0].id, room: rooms[0]}, function(err, reply) {
            console.log("Reply:", err, reply);
            assert.ifError(err);
            done();
        });
    });

    it("customPhrases test - 1", function(done) {
        var t = msg.text;
        msg.text += " cde";
        console.log("Text :", msg.text);
		core.emit("text", msg, function(err, data) {
			console.log("reply:", msg, err);
			var l = msg.labels.abusive;
			assert(l, 1, "Not banning custom word cde");
			delete msg.labels.abusive;
            msg.text = t;
            done();
		});
    });

    it("customPhrases test - 2", function(done) {
        var t = msg.text;
        msg.text += "cde";
		core.emit("text", msg, function(err, data) {
			console.log("reply:", msg, err);
			var l = msg.labels.abusive;
			assert.notEqual(l, 1, "Banning substring cde");
            delete msg.labels.abusive;
            msg.text = t;
			done();
		});
    });

    it("customPhrases test - 3", function(done) {
        var t = msg.text;
        msg.text += " abc def testing test..";
		core.emit("text", msg, function(err, data) {
			console.log("reply:", msg, err);
			var l = msg.labels.abusive;
			assert.equal(l, 1, "not banning");
            delete msg.labels.abusive;
            msg.text = t;
			done();
		});
    });

    it("customPhrases test - 4", function(done) {
        var t = msg.text;
        msg.text += " abc testing test..";
		core.emit("text", msg, function(err, data) {
			console.log("reply:", msg, err);
			var l = msg.labels.abusive;
			assert.notEqual(l, 1, "not banning");
            delete msg.labels.abusive;
            msg.text = t;
			done();
		});
    });

});
