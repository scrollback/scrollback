var assert = require("assert");
var core = require("../test/mock-core.js")();
var validator = require("./validator.js")(core);
var generate = require("../lib/generate.js");

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
	describe('generic-test', function() {
		it('Should throw an error if TYPE is undefined', function(done) {
			core.emit("away",{id:generate.uid()}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "INVALID_ACTION_TYPE", "Error message is incorrect");
				done();
			});
		});
		it('Should throw an error if FROM is undefined', function(done) {
			core.emit("text",{id:generate.uid(),type:"text"}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "INVALID_USER", "Error message is incorrect");
				done();
			});
		});
		it('Should throw an error if TO is undefined', function(done) {
			core.emit("back",{id:generate.uid(),type:"back",from: generate.names(6)}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "INVALID_ROOM", "Error message is incorrect");
				done();
			});
		});

		it('Should throw an error if SESSION is undefined', function(done) {
			core.emit("text",{id:generate.uid(),type:"text",from: generate.names(6), to:generate.names(6)}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "NO_SESSION_ID", "Error message is incorrect");
				done();
			});
		});
		it('Should set id to some value if it is undefined', function(done) {
			core.emit("text",{type:"text",text:"hi there...", from: generate.names(6), 
				to: generate.names(6), session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
					assert(!err,"ERROR thrown when it shouldnt.");
					assert(data.id, "ID not set by validator");
					done();
			});
		});
		it('Should set time to current time if it is undefined', function(done) {
			core.emit("text",{id:generate.uid(),type:"text",text:"some random text", from: generate.names(6), 
				to: generate.names(6), session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
					assert(!err,"ERROR thrown when it shouldnt.");
					assert(data.time, "time not set by validator");
					done();
			});
		});
		it('Should not throw an err when all the properties are set correctly', function(done) {
			core.emit("text",{id:generate.uid(),type:"text",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn",text:"hi there... how are you?" }, function(err, data) {
				assert(!err, "Message not sent");
				done();
			});
		});
	});

	describe('Testing text messages', function(done) {
		it('Should throw an error when text property is missing.', function(done) {
			core.emit("text",{id: generate.uid(),type:"text",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "TEXT_MISSING", "Error message is incorrect");
				done();
			});
		});
		it('should not throw an error when all the properties are specified and valid.', function(done) {
			core.emit("text",{id: generate.uid(),type:"text",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn", text:'hi there!!!'}, function(err, data) {
				assert(!err, "Error thrown when it shouldnt");
				done();
			});
		});
	});

	describe('Testing join/part messages', function(done) {
		it('Should set role to "follower" if it is undefined', function(done) {
			core.emit("join",{id:generate.uid(),type:"join",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(!err, "Error thrown when it shouldnt");
				assert.equal(data.role, "follower","Not setting the default value for role correctly")
				done();
			});
		});
		it('Should set role to "none" if it is undefined', function(done) {
			core.emit("part",{id:generate.uid(),type:"part",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(!err, "Error thrown when it shouldnt");
				assert.equal(data.role, "none","Not setting the default value for role correctly")
				done();
			});
		});
	});


	describe('Testing admit/expel messages', function(done) {
		it('Should throw an error if ref is undefined', function(done) {
			core.emit("admit",{id:generate.uid(),type:"admit",from: generate.names(6), text:"ok this is fine...", to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "REF_NOT_SPECIFIED", "Error message is incorrect");
				done();
			});
		});
		it('Should throw an error if ref is undefined', function(done) {
			core.emit("admit",{id:generate.uid(),type:"admit",from: generate.names(6), text:"ok this is fine...", to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn", ref: "nsdf@#"}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "INVALID_REF", "Error message is incorrect");
				done();
			});
		});
		it('Should set role to "follow_invited" if it is undefined', function(done) {
			core.emit("admit",{id:generate.uid(),type:"admit",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn", ref:"harish"}, function(err, data) {
				assert(!err, "Error thrown when it shouldnt");
				assert.equal(data.role, "follow_invited","Not setting the default value for role correctly")
				done();
			});
		});
		it('Should set role to "banned" if it is undefined', function(done) {
			core.emit("expel",{id:generate.uid(),type:"expel",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn", ref:"harish"}, function(err, data) {
				assert(!err, "Error thrown when it shouldnt");
				assert.equal(data.role, "banned","Not setting the default value for role correctly")
				done();
			});
		});
	});

	describe("Testing edit messages", function(){
		it('Should throw an error if ref is undefined', function(done) {
			core.emit("edit",{id:generate.uid(),type:"edit",from: generate.names(6), to:generate.names(6),  
				session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "REF_NOT_SPECIFIED", "Error message is incorrect");
				done();
			});
		});
		it('Should throw an error if both text and label is undefined', function(done) {
			core.emit("edit",{id:generate.uid(),type:"edit",from: generate.names(6), to:generate.names(6),  
				ref: generate.uid(), session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(err, "Error not thrown");
				assert.equal(err.message, "NO_OPTION_TO_EDIT", "Error message is incorrect");
				done();
			});
		});
		it('Should not throw an error if one of the following is specified: text, label', function(done) {
				core.emit("edit",{id:generate.uid(),type:"edit",from: generate.names(6), to:generate.names(6), text:"hiihi", 
				ref:generate.uid(), session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(!err,"ERROR thrown when it shouldnt.");
				done();
			});
		});
		it('Should not throw an error if one of the following is specified: text, label', function(done) {
				core.emit("edit",{id:generate.uid(),type:"edit",from: generate.names(6), to:generate.names(6), label:{hi:1},
				ref:generate.uid(), session:"http:127.0.0.1:ajsdbhciahnasjdnfn"}, function(err, data) {
				assert(!err,"ERROR thrown when it shouldnt.");
				done();
			});
		});	
	});
});