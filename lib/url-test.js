/* eslint-env mocha */

"use strict";

var url = require("./url.js"),
	assert = require("assert");

describe("parse", function() {
	it("should throw error on invalid url", function() {
		assert.throws(function() {
			url.parse(null);
		}, /ERR_INVALID_TYPE/);
	});

	it("should modify given state", function() {
		var path = "http://localhost:7528/me",
			state1 = { nav: { mode: "home" } },
			state2 = { nav: { mode: "home" }, context: { env: "android" } };

		assert.equal(url.parse(path, state1), state1);
		assert.equal(url.parse(path, state2), state2);
		assert.deepEqual(url.parse(path, state1), { nav: { mode: "home" } });
		assert.deepEqual(url.parse(path, state2), { nav: { mode: "home" }, context: { env: "android" } });
	});

	it("should ignore protocol and host", function() {
		var path1 = "http://localhost:7528/someroom/all/all-messages",
			path2 = "//localhost:7528/someroom/all/all-messages",
			path3 = "/someroom/all/all-messages",
			path4 = "someroom/all/all-messages",
			result = {
				nav: {
					mode: "chat",
					room: "someroom",
					thread: null,
					textRange: {
						before: 30,
						time: null
					}
				}
			};

		assert.deepEqual(url.parse(path1), result);
		assert.deepEqual(url.parse(path2), result);
		assert.deepEqual(url.parse(path3), result);
		assert.deepEqual(url.parse(path4), result);
	});

	it("should parse url with /me", function() {
		var path = "/me";

		assert.deepEqual(url.parse(path), { nav: { mode: "home" } });
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
			}
		});
	});

	it("should parse url with incorrect case /roomname", function() {
		var path = "/SomeRoom";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "room",
				room: "someroom",
				threadRange: {
					before: 20,
					time: null
				}
			}
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
			}
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
			}
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
			}
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
			}
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
			}
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
			}
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
			}
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
			}
		});
	});

	it("should parse url with query parameters", function() {
		var path = "/someroom/abc456def?t=1214340045721&embed=(form:toast,minimize:--)&d=createroom&ds=o!(signingUp:--)&v=sidebar-right";

		assert.deepEqual(url.parse(path), {
			nav: {
				mode: "chat",
				room: "someroom",
				thread: "abc456def",
				view: "sidebar-right",
				dialog: "createroom",
				dialogState: { signingUp: false },
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
		}, /ERR_INVALID_STATE/);

		assert.throws(function() {
			url.build(state2);
		}, /ERR_INVALID_STATE/);
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
						minimize: true
					}
				}
			};

		assert.equal(url.build(state), "/someroom/all?embed=(form:toast,minimize:++)");
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

		assert.equal(url.build(state), "/someroom?d=createroom&ds=o!(signingUp:--)&v=sidebar-right");
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

describe("parse and build", function() {
	it("should parse url to state and build same url from the state", function() {
		var path = "/someroom/abc456def?t=1214340045721&embed=(form:toast,minimize:--)&d=createroom&ds=o!(signingUp:--)&v=sidebar-right";

		assert.equal(url.build(url.parse(path)), path);
	});

	it("should build url from state and parse same state from the url", function() {
		var state = {
				nav: {
					mode: "chat",
					room: "someroom",
					thread: "abc456def",
					textRange: {
						time: 1434440076830,
						after: 30
					}
				}
			};

		assert.deepEqual(url.parse(url.build(state)), state);
	});

	it("should ignore handle undefined in objects and arrays", function() {
		/* eslint-disable no-undefined */
		var state = {
				nav: {
					mode: "home",
					dialog: undefined,
					dialogState: [ "a", undefined, "b", "c" ]
				}
			};

		assert.deepEqual(url.parse(url.build(state)), {
			nav: {
				mode: "home",
				dialogState: [ "a", null, "b", "c" ]
			}
		});
	});
});
