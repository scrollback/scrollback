/* jshint mocha: true */
var assert = require('assert');
var core, config, store;



module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;

	describe("basic setState test", function() {
		it("Changing rooms", function(done) {
			core.emit("setState", {
				nav: {
					room: "scrollbackteam"
				}
			}, function() {
				assert.equal(store.getNav("room"), "scrollbackteam", "Navigation didnot happen");
				done();
			});
		});

		it("Changing multiple properties in nav", function(done) {
			core.emit("setState", {
				nav: {
					room: "scrollback",
					view: "people"
				}
			}, function() {
				assert.equal(store.getNav("room"), "scrollback", "Navigation didnot happen");
				assert.equal(store.getNav("view"), "people", "Navigation didnot happen");
				done();
			});
		});
		
		it("setting objects in nav", function(done) {
			core.emit("setState", {
				nav: {
					dialog:{
						prop1: "hi",
						prop2: "hello"
					}
				}
			}, function() {
				assert.equal(store.getNav("dialog").prop1, "hi", "Navigation didnot happen");
				assert.equal(store.getNav("dialog").prop2, "hello", "Navigation didnot happen");
				done();
			});
		});
		
		it("setting objects in context", function(done) {
			core.emit("setState", {
				context: {
					embed:{
						domain: "h10.in",
						suggestedNick: "hi"
					}
				}
			}, function() {
				assert.equal(store.getContext("embed").domain, "h10.in", "Navigation didnot happen");
				assert.equal(store.getContext("embed").suggestedNick, "hi", "Navigation didnot happen");
				done();
			});
		});
		
		it("changing objects in nav", function(done) {
			core.emit("setState", {
				nav: {
					dialog:{
						prop1: "what"
					}
				}
			}, function() {
				assert.equal(store.getNav("dialog").prop1, "what", "Navigation didnot happen");
				assert.equal(store.getNav("dialog").prop2, "hello", "Navigation didnot happen");
				done();
			});
		});		
		
		it("setting arrays in app", function(done) {
			core.emit("setState", {
				app: {
					CTAS:["signin", "logs"]
				}
			}, function() {
				assert.equal(store.getApp("CTAS").length,2, "Navigation didnot happen");
				assert.equal(store.getApp("CTAS")[0], "signin", "Navigation didnot happen");
				assert.equal(store.getApp("CTAS")[1], "logs", "Navigation didnot happen");
				done();
			});
		});
		
		it("changing arrays in app", function(done) {
			core.emit("setState", {
				app: {
					CTAS:["signup", "logs"]
				}
			}, function() {
				assert.equal(store.getApp("CTAS").length,2, "Navigation didnot happen");
				assert.equal(store.getApp("CTAS")[0], "signup", "Navigation didnot happen");
				assert.equal(store.getApp("CTAS")[1], "logs", "Navigation didnot happen");
				done();
			});
		});
		
		it("deleting arrays in app", function(done) {
			core.emit("setState", {
				app: {
					CTAS: null
				}
			}, function() {
				assert(!store.getApp("CTAS"), "Navigation didnot happen");
				done();
			});
		});
		
		it("emitting setState with entities.", function(done) {
			core.emit("setState", {
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
		
		
		it("emitting setState with relations.", function(done) {
			core.emit("setState", {
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
		it("emitting setState with relations to merge with old relation.", function(done) {
			core.emit("setState", {
				entities: {
					scrollback_harish: {
						status:"offline"
					},
					scrollbackteam_harish: {
						status:"offline"
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
		
		it("emitting setState with relations update.", function(done) {
			core.emit("setState", {
				entities: {
					scrollbackteam_harish: {
						status:"offline",
						role:"banned"
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
		
		
		it("emitting setState with relations update.", function(done) {
			core.emit("setState", {
				entities: {
					scrollbackteam_harish: {
						status:"offline",
						role:"banned"
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
	});

};