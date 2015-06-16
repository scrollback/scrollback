/* eslint-env mocha */

"use strict";

var url = require("./url.js"),
	assert = require("assert");

describe("build", function() {
	it("should throw error on invalid state", function() {
		var state = {};

		assert.throws(function() {
			url.build(state);
		}, "ERR_INVALID_STATE");
	});

	it("should build url with home", function() {
		var state = {
				nav: {
					mode: "home",
					room: "someroom"
				}
			};

		assert.equal(url.build(state), "/me");
	});

	it("should build url with room", function() {
		var state = {
				nav: {
					mode: "room",
					room: "someroom"
				}
			};

		assert.equal(url.build(state), "/someroom");
	});

	it("should build url when thread is given", function() {
		var state = {
				nav: {
					mode: "chat",
					room: "someroom",
					thread: "abc456def"
				}
			};

		assert.equal(url.build(state), "/someroom/abc456def");
	});

	it("should build url when thread is not given", function() {
		var state = {
				nav: {
					mode: "chat",
					room: "someroom"
				}
			};

		assert.equal(url.build(state), "/someroom/all");
	});

	it("should build url when thread and store are given", function() {
		var state = {
				nav: {
					mode: "chat",
					room: "someroom",
					thread: "abc456def"
				}
			},
			store = {
				get: function() {
					return { title: "Some title" };
				}
			};

		assert.equal(url.build(state, store), "/someroom/abc456def/some-title");
	});

	it("should build url with context", function() {
		var state = {
				nav: {
					mode: "chat",
					room: "someroom"
				},
				context: {
					env: "embed",
					embed: {
						form: "toast",
						minimize: false
					}
				}
			};

		assert.equal(url.build(state), "/someroom/all?embed=%7B%22form%22%3A%22toast%22%2C%22minimize%22%3Afalse%7D");
	});

	it("should build url with threadRange", function() {
		var state = {
				nav: {
					mode: "room",
					room: "someroom",
					thread: "abc456def",
					textRange: { time: 1434440076830 },
					threadRange: { time: 1214340045721 }
				}
			};

		assert.equal(url.build(state), "/someroom?t=1214340045721");
	});

	it("should build url with textRange", function() {
		var state = {
				nav: {
					mode: "chat",
					room: "someroom",
					thread: "abc456def",
					textRange: { time: 1434440076830 },
					threadRange: { time: 1214340045721 }
				}
			};

		assert.equal(url.build(state), "/someroom/abc456def?t=1434440076830");
	});

	it("should shorten properties", function() {
		var state = {
				nav: {
					mode: "room",
					room: "someroom",
					dialog: "createroom",
					dialogState: { signingUp: false },
					view: "sidebar-right"
				}
			};

		assert.equal(url.build(state), "/someroom?d=createroom&ds=%257B%2522signingUp%2522%253Afalse%257D&v=sidebar-right");
	});

	it("should ignore everything except nav", function() {
		var state1 = {
				nav: {
					mode: "chat",
					room: "someroom"
				}
			},
			state2 = {
				nav: {
					mode: "chat",
					room: "someroom"
				},
				context: { env: "android" },
				notes: [ { ref: "456" } ]
			};

		assert.equal(url.build(state1), url.build(state2));
	});
});
