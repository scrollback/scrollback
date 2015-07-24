/* global it */
var assert = require('assert');
var Utils = new(require('./utils.js'))();

var config = {
	global:{
		host:"scrollback.io"
	}
};
var domainAuth = require("../rules/domainRules.js")({}, config);

module.exports = function () {
	describe("Testing domain validation rules:", function(){
		it("missing room", function(){
			var origin = {
				host: "scrollback.io",
				verified: false
			};
			var room;
			assert(domainAuth({room:room, origin:origin}), "undefined room was allowed");
		});
		
		it("missing origin", function(){
			var origin;
			var room = {};
			assert(domainAuth({room:room, origin:origin}), "unverified origin was allowed");
		});
		
		it("not verified domain", function(){
			var origin = {
				host: "scrollback.io",
				verified: false
			};
			var room = {};
			assert(domainAuth({room:room, origin:origin}), "unverified domain was allowed");
		});
		
		it("action with verified domain on room with no allowed domains", function(){
			var origin = {
				host: "dev.scrollback.io",
				verified: true
			};
			var room = {guides:{}};
			assert(!domainAuth({room:room, origin:origin}), "this one should have been allowed");
		});
		
		it("action with verified not allowed domain on room with allowed domains", function(){
			var origin = {
				host: "dev.scrollback.io",
				verified: true
			};
			var room = {guides:{allowedDomains: ["scrollback.io"]}};
			assert(domainAuth({room:room, origin:origin}), "this one should have been allowed");
		});
		
		
		it("action with verified not allowed domain on room with allowed domains", function(){
			var origin = {
				host: "dev.scrollback.io",
				verified: true
			};
			var room = {guides:{allowedDomains: ["scrollback.io", "sock.scrollback.io"]}};
			assert(domainAuth({room:room, origin:origin}), "this one should have been allowed");
		});
		
		
		it("action with verified not allowed domain on room with allowed domains", function(){
			var origin = {
				host: "dev.scrollback.io",
				verified: true
			};
			var room = {guides:{allowedDomains: ["scrollback.io", "dev.scrollback.io"]}};
			assert(!domainAuth({room:room, origin:origin}), "this one should have been allowed");
		});
		
	});
};
