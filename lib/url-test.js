/* eslint-env mocha */

"use strict";

var url = require("./url.js"),
	assert = require("assert");

describe("parse", function() {
	it("should throw error on invalid url", function() {
		assert.throws(function() {
			url.build(null);
		}, "ERR_INVALID_TYPE");
	});

	it("should modify given state", function() {
		var path = "http://localhost:7528/me",
			state1 = { nav: { mode: "home" } },
			state2 = { nav: { mode: "home" }, context: { env: "android" } };

		assert.equal(url.parse(path, state1), state1);
		assert.equal(url.parse(path, state2), state2);
		assert.deepEqual(url.parse(path, state2), { nav: { mode: "home" }, context: { env: "android" } });
		assert.deepEqual(url.parse(path, state1), { nav: { mode: "home" }, context: {} });
	});

	it("should hav nav and context", function() {
		var path1 = "http://localhost:7528/",
			path2 = "/",
			path3 = "",
			result = { nav: { mode: "home" }, context: {} };

		assert.deepEqual(url.parse(path1), result);
		assert.deepEqual(url.parse(path2), result);
		assert.deepEqual(url.parse(path3), result);
	});

	it("should parse url with /me", function() {
		var path = "/me";

		assert.deepEqual(url.parse(path), { nav: { mode: "home" }, context: {} });
	});

	it("should parse url with /roomname", function() {
		var path = "/someroom";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "room",
				room: "someroom",
				threadRange: {
					before: 20,
					time: null
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/all", function() {
		var path = "/someroom/all";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: null,
				textRange: {
					before: 30,
					time: null
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/all/all-messages", function() {
		var path = "/someroom/all/all-messages";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: null,
				textRange: {
					before: 30,
					time: null
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/threadid", function() {
		var path = "/someroom/abc456def";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: "abc456def",
				textRange: {
					before: 30,
					time: null
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/threadid/some-thread-title", function() {
		var path = "/someroom/abc456def/awesome-thread-is-this";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: "abc456def",
				textRange: {
					before: 30,
					time: null
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname?t=1214340045721", function() {
		var path = "/someroom?t=1214340045721";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "room",
				room: "someroom",
				threadRange: {
					before: 20,
					time: 1214340045721
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/all/all-messages?t=1214340045721", function() {
		var path = "/someroom/all/all-messages?t=1214340045721";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: null,
				textRange: {
					after: 30,
					time: 1214340045721
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/threadid?t=1214340045721", function() {
		var path = "/someroom/abc456def?t=1214340045721";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: "abc456def",
				textRange: {
					after: 30,
					time: 1214340045721
				}
			},
			context: {}
		});
	});

	it("should parse url with /roomname/threadid/some-thread-title?t=1214340045721", function() {
		var path = "/someroom/abc456def/awesome-thread-is-this?t=1214340045721";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: "abc456def",
				textRange: {
					after: 30,
					time: 1214340045721
				}
			},
			context: {}
		});
	});

	it("should parse url with query parameters", function() {
		var path = "/someroom/abc456def?embed=%7B%22form%22%3A%22toast%22%2C%22minimize%22%3Afalse%7D&t=1214340045721&d=createroom&ds=%257B%2522signingUp%2522%253Afalse%257D&v=sidebar-right";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: "abc456def",
				view: "sidebar-right",
				dialog: "createroom",
				dialogState: {},
				textRange: {
					after: 30,
					time: 1214340045721
				}
			},

			context: {
				embed: {
					form: "toast",
					minimize: false
				},

				env: "embed"
			}
		});
	});
});

describe("build", function() {
	it("should throw error on invalid state", function() {
		var state1 = "somestring",
			state2 = { nav: "hello" };

		assert.throws(function() {
			url.build(state1);
		}, "ERR_INVALID_STATE");

		assert.throws(function() {
			url.build(state2);
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
