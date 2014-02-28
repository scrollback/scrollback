var assert = require("assert");
var core = require("../test/mock-core.js")();
var db = require("../test/mock-storage.js")(core);
var e = require("./entityloader.js")(core);
var guid = require("../lib/guid.js");
var names = require("../lib/names.js");

/*****************************************************************************
This file perform tests on the entity loader plugin.
entity loader loads the data required for the action to continue.


for text|back|away|join|part|edit actions:
	should load the user and room object into user and room property of the payload 
	using the from as userid and to as roomid.


for edit
	should load the old message object into old property using ref as the messageid.
	throw err if the message object for the specified message id is not found.

for room|user
	load the old property 
*****************************************************************************/

describe('EntityLoader', function() {


	it('should load user and room from storage object', function(done) {
		core.emit("text", { id: guid(), from: "harish", to: "scrollback", text:"hi there how are you?",
			session: "web:127.0.0.1:asdhouasnoujnvihdbfaksdmcrouadf"}, function(err, data) {
			assert(!err,"threw an error when it shouldnt.");
			assert.equal(data.user.timezone == 330,"User object loaded incorrectly");
			assert.equal(data.room.timezone == 300,"Room object loaded incorrectly");

		});
	});
	it('should load user from storage object and initialize room object', function(done) {
		core.emit("text", { id: guid(), from: "harish", to: names(8), text:"hi there how are you?",
			session: "web:127.0.0.1:asdhouasnoujnvihdbfaksdmcrouadf"}, function(err, data) {
			assert(!err,"threw an error when it shouldnt.");
			assert.equal(data.user.timezone == 330,"User object loaded incorrectly");
			assert(data.room.id, "doesnt initialize when the object is not in db");
		});
	});
	it('should initialize user and room object', function(done) {
		core.emit("text", { id: guid(), from: names(8), to: names(8), text:"hi there how are you?",
			session: "web:127.0.0.1:asdhouasnoujnvihdbfaksdmcrouadf"}, function(err, data) {
			assert(!err,"threw an error when it shouldnt.");
			assert.equal(data.user.timezone == 330,"User object loaded incorrectly");
			assert(data.room.id, "doesnt initialize room when the object is not in db");
			assert(data.user.id, "doesnt initialize user when the object is not in db");
		});
	});




	it('should throw an error when ref is not specified', function(done) {
		core.emit("edit", { id: guid(), from: names(8), to: names(8), ref:guid(), text:"hi there how are you?",
			session: "web:127.0.0.1:asdhouasnoujnvihdbfaksdmcrouadf"}, function(err, data) {
			assert(err,"Should have thrown an error");
			assert.equal(err.message,"REF_NOT_SPECIFIED", "some other error");
		});
	});
	it('should throw an error when a message object not available for the given ref.', function(done) {
		core.emit("edit", { id: guid(), from: names(8), to: names(8), ref:guid(), text:"hi there how are you?",
			session: "web:127.0.0.1:asdhouasnoujnvihdbfaksdmcrouadf"}, function(err, data) {
			assert(err,"Should have thrown an error");
			assert.equal(err.message,"MESSAGE_NOT_FOUND", "some other error");
		});
	});



	it('should throw an error when a message object not available for the given ref.', function(done) {
		core.emit("room", { id: guid(), from: names(8), to: names(8), ref:guid(), text:"hi there how are you?",
			session: "web:127.0.0.1:asdhouasnoujnvihdbfaksdmcrouadf"}, function(err, data) {
			assert(err,"Should have thrown an error");
			assert.equal(err.message,"MESSAGE_NOT_FOUND", "some other error");
		});
	});

});