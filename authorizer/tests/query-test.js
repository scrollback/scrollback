/* eslint-env mocha */
var assert = require('assert');
var generate = require("../../lib/generate.js");

module.exports = function(core) {
	describe("Rooms query with identities", function() {
		it("should authorize getRooms with partial id", function(done) {
			var query = {
				id: generate.uid(),
				type: "getRooms",
				identity: "irc",
				user: {
					role: "owner"
				},
				session: generate.uid()
			};
			core.emit("getRooms", query, function(err) {
				assert(err, "Error not thrown");
				done();
			});
		});
		
		it("should authorize getRooms with full id", function(done) {
			var query = {
				id: generate.uid(),
				type: "getRooms",
				identity: "irc://scrollback.io/#scrollback",
				user: {
					role: "owner"
				},
				session: generate.uid()
			};
			
			core.emit("getRooms", query, function(err) {
				assert(!err, "Error thrown");
				done();
			});
		});
		
		it("should authorize getRooms with partial id by su", function(done) {
			var query = {
				id: generate.uid(),
				type: "getRooms",
				identity: "irc",
				user: {
					role: "su"
				},
				session: generate.uid()
			};
			core.emit("getRooms", query, function(err, query) {
				console.log(arguments);
				assert(!err, "Error thrown");
				assert(query, "Did not give back the query");
				done();
			});
		});
		it("should authorize getRooms with partial id by su", function(done) {
			var query = {
				id: generate.uid(),
				type: "getRooms",
				identity: "irc://scrollback.io/#scrollback",
				user: {
					role: "su"
				},
				session: generate.uid()
			};
			core.emit("getRooms", query, function(err, query) {
				console.log(arguments);
				assert(!err, "Error thrown");
				assert(query, "Did not give back the query");
				done();
			});
		});
		it("should authorize getRooms with partial id by su", function(done) {
			var query = {
				id: generate.uid(),
				type: "getRooms",
				identity: "irc://scrollback.io/#scrollback",
				user: {
					role: "system"
				},
				session: "internal-test"
			};
			core.emit("getRooms", query, function(err, query) {
				console.log(arguments);
				assert(!err, "Error thrown");
				assert(query, "Did not give back the query");
				done();
			});
		});
		it("should authorize getRooms with partial id by su", function(done) {
			var query = {
				id: generate.uid(),
				type: "getRooms",
				identity: "irc",
				user: {
					role: "system"
				},
				session: "internal-test"
			};
			core.emit("getRooms", query, function(err, query) {
				console.log(arguments);
				assert(!err, "Error thrown");
				assert(query, "Did not give back the query");
				done();
			});
		});
	});
};