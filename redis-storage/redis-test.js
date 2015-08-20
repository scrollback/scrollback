/* eslint-env mocha */
/* eslint max-nested-callbacks: 0*/
"use strict";
var assert = require('assert');
var core = new(require('ebus'))();
var generate = require("../lib/generate.js");
var config = require("../server-config-defaults.js");
require("./redis-storage.js")(core, config["redis-storage"]);

describe("user and room action", function() {
	it("storing user harish", function(done) {
		core.emit("user", {
			id: generate.uid(),
			type: "user",
			user: {
				id: "harish",
				description: "this is me?",
				type: "user",
				picture: "http://gravatar.com/avatar/alscalladf",
				identities: ["mailto:harish@scrollback.io"],
				params: {}
			}
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "Action not returned");
			done();
		});
	});
	it("storing user arvind", function(done) {
		core.emit("user", {
			id: generate.uid(),
			type: "user",
			user: {
				id: "arvind",
				description: "this is him",
				type: "user",
				picture: "http://gravatar.com/avatar/ksdcnsdjfsl",
				identities: ["mailto:arvind@scrollback.io"],
				params: {}
			}
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "Action not returned");
			done();
		});
	});
	it("storing user amal", function(done) {
		core.emit("user", {
			id: generate.uid(),
			type: "user",
			user: {
				id: "amal",
				description: "this is another him",
				type: "user",
				picture: "http://gravatar.com/avatar/coaubnllnksdj",
				identities: ["mailto:amal@scrollback.io"],
				params: {}
			}
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "Action not returned");
			done();
		});
	});
	it("storing room scrollback", function(done) {
		core.emit("room", {
			id: generate.uid(),
			type: "room",
			room: {
				id: "scrollback",
				description: "this is a room",
				type: "room",
				params: {}
			},
			user: {
				id: "harish"
			}
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "Action not returned");
			done();
		});
	});
	it("storing room node", function(done) {
		core.emit("room", {
			id: generate.uid(),
			type: "room",
			room: {
				id: "node",
				description: "this is a room",
				type: "room",
				params: {}
			},
			user: {
				id: "arvind"
			}
		}, function(err, data) {
			assert(!err, err);
			assert(data, "Action not returned");
			done();
		});
	});
});

describe("get queries: ", function() {
	it("getting user by id:", function(done) {
		core.emit("getUsers", {
			ref: "arvind"
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			done();
		});
	});
	it("getting room by id:", function(done) {
		core.emit("getRooms", {
			ref: "scrollback"
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			done();
		});
	});
	it("getting room that doesnt exist:", function(done) {
		core.emit("getRooms", {
			ref: "scrollback1"
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(!data.results, "why did it give results?");
			done();
		});
	});
	it("getting user that doesnt exist:", function(done) {
		core.emit("getUsers", {
			ref: "harish1"
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(!data.results, "why did it give results?");
			done();
		});
	});
	it("getting user with multiple ids", function(done) {
		core.emit("getUsers", {
			ref: ["harish", "arvind"]
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			done();
		});
	});
	it("getting user with multiple ids with some missing", function(done) {
		core.emit("getUsers", {
			ref: ["harish", "arvind1"]
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(!data.results, "why did it give results?");
			done();
		});
	});
	it("getting rooms with multiple ids", function(done) {
		core.emit("getRooms", {
			ref: ["scrollback", "node"]
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			done();
		});
	});
	it("getting room with multiple ids with some missing", function(done) {
		core.emit("getRooms", {
			ref: ["scrollback", "harish"]
		}, function(err, data) {
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(!data.results, "why did it give results?");
			done();
		});
	});
	it("storing room scrollbackteam2", function(done) {
		core.emit("room", {
			id: generate.uid(),
			type: "room",
			room: {
				id: "scrollbackteam2",
				description: "this is a room",
				type: "room",
				params: {}
			},
			user: {
				id: "harish"
			}
		}, function(err, data) {
			assert(!err, err);
			assert(data, "Action not returned");
			done();
		});
	});
});
