/* eslint-env mocha */
/*eslint no-unused-vars: 0*/
/*eslint no-console: 0*/
"use strict";
var assert = require("assert");
var core = new (require('ebus'))();
var config = require("../../server-config-defaults.js");
var validator;
var generate = require("../../lib/generate.js");

var action = {
	id: generate.uid(33),
	type: 'text',
	to: "me",
	time: new Date().getTime(),
	session: "web://" + generate.uid(32),
	resource: "web",
	origin: {
		gateway: "web"
	}
};

function copy() {
	return JSON.parse(JSON.stringify(action));
}

describe('Validator Test', function() {

	before(function(done) {
		validator= require("./actionvalidator.js")(core, config.validator);
		done();//setTimeout(done, 2000);
	});

	it("should not allow init action if suggested nick is an object.", function(done) {
		var t = copy(action);
		t.type = "init";
		t.suggestedNick = {};
		core.emit("init", t, function(err) {
			console.log("Init", arguments);
			assert.equal(err instanceof Error, true, "Not throwing error for invalid Init..");
			done();
		});

	});

	it("Valid init action with time 'null'", function(done) {
		var t = copy(action);
		t.type = "init";
		t.to = "me";
		t.time = null;
		core.emit("init", t, function(err) {
			assert.equal(err instanceof Error, false, "validation successful");
			done();
		});

	});

	it("Valid init action", function(done) {
		var t = copy(action);
		t.type = "init";
		t.to = "me";
		core.emit("init", t, function(err) {
			assert.equal(err instanceof Error, false, "validation successful");
			done();
		});

	});

	it("should not allow text action without text.", function(done) {
		var t = copy(action);
		t.type = "text";
		t.text = "";
		t.to = "scrollback";
		t.from = "testinguser";
		core.emit("text", t, function(err) {
			assert.equal(err instanceof Error, true, "should not allow text action without text.");
			done();
		});
	});

	it("valid text action with time null", function(done) {
		var t = copy(action);
		t.type = "text";
		t.text = "this is testing message";
		t.to = "scrollback";
		t.from = "testinguser";
		t.time = null;
		core.emit("text", t, function(err) {
			assert.equal(err instanceof Error, false, "not allowing valid text action.");
			done();
		});
	});

	it("valid text action", function(done) {
		var t = copy(action);
		t.type = "text";
		t.text = "this is testing message";
		t.to = "scrollback";
		t.from = "testinguser";
		core.emit("text", t, function(err) {
			assert.equal(err instanceof Error, false, "not allowing valid text action.");
			done();
		});
	});

	it("should not allow room action without params or guides.", function(done) {
		var t = copy(action);
		t.type = "room";
		t.to = "scrollback";
		t.from = "testinguser";
		t.room = {
			id: "scrollback",
			type: "room",
			identities: ["web://testing.com"]

		};
		core.emit("room", t, function(err) {
			assert.equal(err instanceof Error, true, "room with no params and guides is allowed.");
			done();
		});
	});

	it("valid room action", function(done) {
		var t = copy(action);
		t.type = "room";
		t.to = "scrollback";
		t.from = "testinguser";
		t.room = {
			id: "scrollback",
			type: "room",
			identities: ["web://testing.com"],
			params: {},
			guides: {}
		};
		core.emit("room", t, function(err) {
			assert.equal(err instanceof Error, false, "not allowing valid room action.");
			done();
		});
	});
	it("should not allow user action without params or guides.", function(done) {
		var t = copy(action);
		t.type = "user";
		t.from = "testinguser";
		t.user = {
			id: "testinguser",
			type: "user",
			identities: ["web://testing.com"]

		};
		core.emit("user", t, function(err) {
			assert.equal(err instanceof Error, true, "user with no params and guides is allowed.");
			done();
		});
	});

	it("should not allow user action without params", function(done) {
		var t = copy(action);
		t.type = "user";
		t.from = "testinguser";
		t.user = {
			id: "testinguser",
			type: "user",
			identities: ["web://testing.com"],
			guides: {}
		};
		core.emit("user", t, function(err) {
			assert.equal(err instanceof Error, true, "user with no params is allowed.");
			done();
		});
	});


	it("valid user action", function(done) {
		var t = copy(action);
		t.type = "user";
		t.from = "testinguser";
		t.user = {
			id: "scrollback",
			type: "room",
			identities: ["web://testing.com"],
			params: {},
			guides: {}
		};
		core.emit("user", t, function(err) {
			assert.equal(err instanceof Error, false, "not allowing valid user action.");
			done();
		});
	});



});
