/* eslint-env mocha */
var assert = require('assert');
var core, config, store;



module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;

	describe("basic setstate test", function() {
		it("Changing rooms", function(done) {
			core.emit("setstate", {
				nav: {
					room: "scrollbackteam"
				}
			}, function() {
				assert.equal(store.get("nav", "room"), "scrollbackteam", "Navigation didnot happen");
				done();
			});
		});

		it("Changing multiple properties in nav", function(done) {
			core.emit("setstate", {
				nav: {
					room: "scrollback",
					view: "people"
				}
			}, function() {
				assert.equal(store.get("nav", "room"), "scrollback", "Navigation didnot happen");
				assert.equal(store.get("nav", "view"), "people", "Navigation didnot happen");
				done();
			});
		});

		it("setting objects in nav", function(done) {
			core.emit("setstate", {
				nav: {
					dialog: {
						prop1: "hi",
						prop2: "hello"
					}
				}
			}, function() {
				assert.equal(store.get("nav", "dialog").prop1, "hi", "Navigation didnot happen");
				assert.equal(store.get("nav", "dialog").prop2, "hello", "Navigation didnot happen");
				done();
			});
		});

		it("setting objects in context", function(done) {
			core.emit("setstate", {
				context: {
					origin: {
						host: "h10.in"
					},
					init: {
						suggestedNick: "hi"
					}
				}
			}, function() {
				assert.equal(store.get("context", "origin").host, "h10.in", "Navigation didnot happen");
				assert.equal(store.get("context", "init").suggestedNick, "hi", "Navigation didnot happen");
				done();
			});
		});

		it("changing objects in nav", function(done) {
			core.emit("setstate", {
				nav: {
					dialog: {
						prop1: "what"
					}
				}
			}, function() {
				assert.equal(store.get("nav", "dialog").prop1, "what", "Navigation didnot happen");
				assert.equal(store.get("nav", "dialog").prop2, "hello", "Navigation didnot happen");
				done();
			});
		});

		it("setting arrays in app", function(done) {
			core.emit("setstate", {
				app: {
					CTAS: ["signin", "logs"]
				}
			}, function() {
				assert.equal(store.get("app", "CTAS").length, 2, "Navigation didnot happen");
				assert.equal(store.get("app", "CTAS")[0], "signin", "Navigation didnot happen");
				assert.equal(store.get("app", "CTAS")[1], "logs", "Navigation didnot happen");
				done();
			});
		});

		it("changing arrays in app", function(done) {
			core.emit("setstate", {
				app: {
					CTAS: ["signup", "logs"]
				}
			}, function() {
				assert.equal(store.get("app", "CTAS").length, 2, "Navigation didnot happen");
				assert.equal(store.get("app", "CTAS")[0], "signup", "Navigation didnot happen");
				assert.equal(store.get("app", "CTAS")[1], "logs", "Navigation didnot happen");
				done();
			});
		});

		it("deleting arrays in app", function(done) {
			core.emit("setstate", {
				app: {
					CTAS: null
				}
			}, function() {
				assert(!store.get("app", "CTAS"), "Navigation didnot happen");
				done();
			});
		});

		it("emitting setstate with entities.", function(done) {
			core.emit("setstate", {
				entities: {
					scrollback: {
						id: "scrollback",
						description: "scrollback description"
					},
					scrollbackteam: {
						id: "scrollbackteam",
						description: "scrollbackteam description"
					},
					harish: {
						id: "harish",
						description: "this guy is freaking awesome."
					}
				}
			}, function() {
				assert.equal(store.getRoom("scrollback").id, "scrollback", "Navigation didnot happen");
				assert.equal(store.getRoom("scrollbackteam").id, "scrollbackteam", "Navigation didnot happen");
				assert.equal(store.getUser("harish").id, "harish", "Navigation didnot happen");
				done();
			});
		});


		it("emitting setstate with relations.", function(done) {
			core.emit("setstate", {
				entities: {
					scrollback_harish: {
						room: "scrollback",
						user: "harish",
						role: "owner"
					},
					scrollbackteam_harish: {
						room: "scrollbackteam",
						user: "harish",
						role: "follower"
					}
				}
			}, function() {
				assert.equal(store.getRoom("scrollback").id, "scrollback", "Navigation didnot happen");
				assert.equal(store.getRoom("scrollbackteam").id, "scrollbackteam", "Navigation didnot happen");
				assert.equal(store.getUser("harish").id, "harish", "Navigation didnot happen");
				done();
			});
		});
		it("emitting setstate with relations to merge with old relation.", function(done) {
			core.emit("setstate", {
				entities: {
					scrollback_harish: {
						status: "offline"
					},
					scrollbackteam_harish: {
						status: "offline"
					}
				}
			}, function() {
				var results = {};
				store.getRelatedRooms("harish").forEach(function(e) {
					results[e.id] = e;
				});
				assert.equal(results.scrollback.id, "scrollback", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.id, "scrollbackteam", "Navigation didnot happen");
				assert.equal(results.scrollback.status, "offline", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.status, "offline", "Navigation didnot happen");
				assert.equal(results.scrollback.role, "owner", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.role, "follower", "Navigation didnot happen");
				done();
			});
		});

		it("emitting setstate with relations update.", function(done) {
			core.emit("setstate", {
				entities: {
					scrollbackteam_harish: {
						status: "offline",
						role: "banned"
					}
				}
			}, function() {
				var results = {};
				store.getRelatedRooms("harish").forEach(function(e) {
					results[e.id] = e;
				});
				assert.equal(results.scrollback.id, "scrollback", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.id, "scrollbackteam", "Navigation didnot happen");
				assert.equal(results.scrollback.status, "offline", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.status, "offline", "Navigation didnot happen");
				assert.equal(results.scrollback.role, "owner", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.role, "banned", "Navigation didnot happen");
				done();
			});
		});


		it("emitting setstate with relations update. banning.", function(done) {
			core.emit("setstate", {
				entities: {
					scrollbackteam_harish: {
						status: "offline",
						role: "banned"
					}
				}
			}, function() {
				var results = {};
				store.getRelatedRooms("harish", {
					role: "banned"
				}).forEach(function(e) {
					results[e.id] = e;
				});
				assert(!results.scrollback, "Navigation didnot happen");
				assert.equal(results.scrollbackteam.id, "scrollbackteam", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.status, "offline", "Navigation didnot happen");
				assert.equal(results.scrollbackteam.role, "banned", "Navigation didnot happen");
				done();
			});
		});
	});
};
