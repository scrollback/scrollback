var assert = require("assert");
var core = require("../test/mock-core.js")();
var validator = require("./validator.js")(core);
var guid = require("../lib/guid.js");
var names = require("../lib/names.js");

/*****************************************************************************

This file perform tests on the validator plugin based on the new schema.
Validator plugin will listen for all actions. throw errors if critical properties are missing and fill the properties if it can.
should be the first app for all types of messages.


for text|back|away|join|part|admit|expel|room|user|edit|init actions:

	critical properties:
		type
		from
		to
		session


	properties that the plugin can fill
		time
		id


for text
	critical properties:
		text
	
	properties that the plugin can fill
		mentions  -> if not present then set it to empty array [].
		labels  -> if not present then set it to empty object {}.
		editInverse  -> if not present then set it to empty array [].


for join
	properties that the plugin can fill
		role  -> if not present then set it to followers.

for part
	properties that the plugin can fill
		role  -> if not present then set it to none.


for admit
	critical properties:
		ref
	properties that the plugin can fill
		role  -> followers

for expel
	critical properties:
		ref
	properties that the plugin can fill
		role  -> banned

for init
	?????????????????
*****************************************************************************/
describe('validator', function() {
	it('Should throw an error if TYPE is undefined', function(done) {
		core.emit("text",{id:guid()}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "INVALID_ACTION_TYPE", "Error message is incorrect");
			done();
		});
	});
	it('Should throw an error if FROM is undefined', function(done) {
		core.emit("text",{id:guid(),type:"text"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "INVALID_USER", "Error message is incorrect");
			done();
		});
	});
	it('Should throw an error if TO is undefined', function(done) {
		core.emit("text",{id:guid(),type:"text",from: names(6)}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "INVALID_ROOM", "Error message is incorrect");
			done();
		});
	});

	it('Should throw an error if SESSION is undefined', function(done) {
		core.emit("text",{id:guid(),type:"text",from: names(6), to:names(6)}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "NO_SESSION_ID", "Error message is incorrect");
			done();
		});
	});
	it('Should throw an error if text is undefined', function(done) {
		core.emit("text",{id:guid(),type:"text",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "TEXT_MISSING", "Error message is incorrect");
			done();
		});
	});
	it('Should set id to some value if it is undefined', function(done) {
		core.emit("text",{type:"text",text:"hi there...", from: names(6), 
			to: names(6), session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(!err,"ERROR thrown when it shouldnt.");
				assert(data.id, "ID not set by validator");
				done();
		});
	});
	it('Should set time to current time if it is undefined', function(done) {
		core.emit("text",{id:guid(),type:"text",text:"some random text", from: names(6), 
			to: names(6), session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(!err,"ERROR thrown when it shouldnt.");
				assert(data.time, "time not set by validator");
				done();
		});
	});
	it('Should not throw an err when all the properties are set correctly', function(done) {
		core.emit("text",{id:guid(),type:"text",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn",text:"hi there... how are you?" }, function(err, data) {
			assert(!err, "Message not sent");
			done();
		});
	});
	it('Should set role to "follower" if it is undefined', function(done) {
		core.emit("join",{id:guid(),type:"join",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(!err, "Error thrown when it shouldnt");
			assert.equal(data.role, "follower","Not setting the default value for role correctly")
			done();
		});
	});
	it('Should set role to "none" if it is undefined', function(done) {
		core.emit("part",{id:guid(),type:"part",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(!err, "Error thrown when it shouldnt");
			assert.equal(data.role, "none","Not setting the default value for role correctly")
			done();
		});
	});
	it('Should throw an error if ref is undefined', function(done) {
		core.emit("admit",{id:guid(),type:"admit",from: names(6), text:"ok this is fine...", to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "REF_NOT_SPECIFIED", "Error message is incorrect");
			done();
		});
	});
	it('Should throw an error if ref is undefined', function(done) {
		core.emit("admit",{id:guid(),type:"admit",from: names(6), text:"ok this is fine...", to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn", ref: "nsdf@#"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "INVALID_REF", "Error message is incorrect");
			done();
		});
	});
	it('Should set role to "follow_invited" if it is undefined', function(done) {
		core.emit("admit",{id:guid(),type:"admit",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn", ref:"harish"}, function(err, data) {
			assert(!err, "Error thrown when it shouldnt");
			assert.equal(data.role, "follow_invited","Not setting the default value for role correctly")
			done();
		});
	});
	it('Should set role to "banned" if it is undefined', function(done) {
		core.emit("expel",{id:guid(),type:"expel",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn", ref:"harish"}, function(err, data) {
			assert(!err, "Error thrown when it shouldnt");
			assert.equal(data.role, "banned","Not setting the default value for role correctly")
			done();
		});
	});
	/*it('Should throw an error if ref is undefined', function(done) {
		core.emit("edit",{id:guid(),type:"edit",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "REF_NOT_SPECIFIED", "Error message is incorrect");
			done();
		});
	});
	it.only('Should throw an error if both text and label is undefined', function(done) {
		core.emit("edit",{id:guid(),type:"edit",from: names(6), to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "NOTHING_CHANGED", "Error message is incorrect");
			done();
		});
	});
	it('Should throw an error if the edit doesnt cause a change.', function(done) {
			core.emit("edit",{id:guid(),type:"edit",from: names(6), labels:{},to:names(6),  
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(err, "Error not thrown");
			assert.equal(err.message, "NOTHING_CHANGED", "Error message is incorrect");
			done();
		});
	});
	it('Should not throw an error if one of the following is specified: text, label', function(done) {
			core.emit("edit",{id:guid(),type:"edit",from: names(6), to:names(6), text:"hiihi", 
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(!err,"ERROR thrown when it shouldnt.");
			done();
		});
	});
	it('Should not throw an error if one of the following is specified: text, label', function(done) {
			core.emit("edit",{id:guid(),type:"edit",from: names(6), to:names(6), label:{hi:1},
			session:"web:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
			assert(!err,"ERROR thrown when it shouldnt.");
			done();
		});
	});*/
});