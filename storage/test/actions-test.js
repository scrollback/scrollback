/* eslint-env mocha */

"use strict";

var assert = require('assert'),
	core = new (require('ebus'))(),
	generate = require("../../lib/generate.js"),
	postgres = require('./../postgres.js'),
	log = require("../../lib/logger.js"),
	storage = require('../storage.js'),
	config = require('./../../server-config-defaults.js'),
	pg = require('pg'),
	utils = require('./utils.js');
config.storage.pg.db = "testingdatabase";// don't change this.

if(process.env.TRAVIS){
	config.storage.pg.server = "direct.stage.scrollback.io";
}
var connString = "pg://" + config.storage.pg.username + ":" + config.storage.pg.password + "@" + config.storage.pg.server + "/" + config.storage.pg.db;


describe("Storage Test(actions).", function() {
	before(function(done) {
		this.timeout(3500);
		storage(core, config.storage);
		if (config.env === 'production') {
			log.w("Can not run test cases in production.");
			return;
		}
		setTimeout(done, 3000);
	});

	beforeEach(function(done) {
		this.timeout(3500);
		if (config.env === 'production') {
			log.w("Can not run test cases in production.");
			return;
		}
		pg.connect(connString, function(err, client, cb) {
			utils.clearTables(client, ['relations', 'entities', 'texts', 'threads'], function() {
				cb();
				done();
			});
		});
	});

	it("Insert new text messagee", function(done) {
		this.timeout(3500);
		var msg = utils.getNewTextAction();
		core.emit("text", msg, function() {
			log("inserted message");
			pg.connect(connString, function(err, client, cb) {
				postgres.runQueries(client,
										 [{query: "SELECT * from texts where id=$1", values: [msg.id]}/*,
										  {query: "SELECT * from threads where id=$1", values: [msg.thread]}*/],
										 function(e, results) {
					log.d("Arguments:", arguments);
					results.forEach(function(result) {
						assert.equal(result.rowCount, 1, "Database doesn't have message Object");
					});
					cb();
					done();
				});
			});
		});
	});

	it("Insert new text message. (Labels and tags)", function(done) {
		this.timeout(3500);
		var msg = utils.getNewTextAction();
		msg.tags.push("abusive");
		msg.tags.push("hidden");
		core.emit("text", msg, function() {
			log("inserted message");
			pg.connect(connString, function(err, client, cb) {
				postgres.runQueries(client,
										[{query: "SELECT * from texts where id=$1", values: [msg.id]}],
										function(e, results) {
					log.d("Arguments:", arguments);
					results.forEach(function(result) {
						result.rows[0].tags.sort();
						assert.deepEqual(result.rows[0].tags, msg.tags.sort(), "tags / labels not saved");
					});
					cb();
					done();
				});
			});
		});
	});

	it("Update Thread", function(done) {
		this.timeout(5000);
		var m1 = utils.getNewTextAction();
		core.emit("text", m1, function() {
			var m2 = utils.getNewTextAction();
			m2.thread = m1.thread;
			core.emit("text", m2, function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
											[{query: "SELECT * from threads where id=$1", values: [m1.thread]}],
											function(e, results) {
						log.d("Arguments:", arguments);
						results.forEach(function(result) {
							assert.equal(result.rows[0].length, 2, "Database doesn't have message Object");
						});
						cb();
						done();
					});
				});
			});
		});
	});

	it("Edit (Edit text)-1", function(done) {
		var m1 = utils.getNewTextAction();
		core.emit("text", m1, function() {
			var text = generate.sentence(11);
			var edit = {
				ref: m1.id,
				text: text,
				time: new Date().getTime()
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
											[{query: "SELECT * from texts where id=$1", values: [m1.id]}],
											function(e, results) {
						log.d("Arguments:", arguments);
						results.forEach(function(result) {
							assert.equal(result.rows[0].text, text, "Updating text failed");
						});
						cb();
						done();
					});
				});
			});
		});
	});
//
	it("Edit (Edit title)-2", function(done) {
		var m1 = utils.getNewTextAction();
		core.emit("text", m1, function() {
			var text = generate.sentence(11);
			var edit = {
				ref: m1.thread,
				title: text,
				time: new Date().getTime()
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
											[{query: "SELECT * from threads where id=$1", values: [m1.thread]}],
											function(e, results) {
						log.d("Arguments:", arguments);
						results.forEach(function(result) {
							assert.equal(result.rows[0].title, text, "Updating title failed");
						});
						cb();
						done();
					});
				});
			});
		});
	});

	it("Edit (labels update)", function(done) {
		var m1 = utils.getNewTextAction();
		m1.tags.push("abusive");
		m1.tags.push("hidden");
		core.emit("text", m1, function() {
			var edit = {
				ref: m1.id,
				labels: {color3: 1},
				time: new Date().getTime(),
				old: m1
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
											[{query: "SELECT * from texts where id=$1", values: [m1.id]}],
											function(e, results) {
						log.d("Arguments:", arguments);
						results.forEach(function(result) {
							result.rows[0].tags.sort();
							assert.deepEqual(result.rows[0].tags, ['abusive', "hidden"], "Updating text failed");
						});
						cb();
						done();
					});
				});
			});
		});
	});

	it("Edit (labels remove/update test.)", function(done) {
		var m1 = utils.getNewTextAction();
		m1.tags.push("abusive");
		m1.tags.push("hidden");
		//m1.labels.color3 = 1;
		core.emit("text", m1, function() {
			var edit = {
				ref: m1.id,
				tags: ["abc", "abusive"], // remove hidden, add abc
				time: new Date().getTime(),
				old: m1
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
										[{query: "SELECT * from texts where id=$1", values: [m1.id]}],
										function(e, results) {
						log.d("Arguments:", arguments);

						results.forEach(function(result) {
							result.rows[0].tags.sort();
							assert.deepEqual(result.rows[0].tags, ['abc', 'abusive'], "Updating text failed");
						});
						cb();
						done();
					});
				});
			});
		});
	});

	it("storing new user.", function(done) {
		var user = utils.getNewUserAction();
		core.emit("user", user, function() {
			pg.connect(connString, function(err, client, cb) {
				postgres.runQueries(client,
										[{query: "SELECT * from entities where id=$1", values: [user.user.id]}],
										function(e, results) {
					log.d("Arguments:", arguments);
					results.forEach(function(result) {
						assert.deepEqual(result.rows[0].id, user.user.id, "Adding new user failed");
					});
					cb();
					done();
				});
			});
		});
	});

	it("storing new user. (timezone)", function(done) {
		var user = utils.getNewUserAction();
		core.emit("user", user, function() {
			pg.connect(connString, function(err, client, cb) {
				postgres.runQueries(client,
										[{query: "SELECT * from entities where id=$1", values: [user.user.id]}],
										function(e, results) {
					log.d("Arguments:", arguments);
					results.forEach(function(result) {
						assert.deepEqual(result.rows[0].timezone, user.user.timezone, "Adding new user failed");
					});
					cb();
					done();
				});
			});
		});
	});


	it("Update user.", function(done) {
		var user = utils.getNewUserAction();
		core.emit("user", user, function() {
			var old = utils.copy(user.user);
			user.old = old;
			user.user.description = generate.sentence(12);
			core.emit("user", user, function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
											[{query: "SELECT * from entities where id=$1", values: [user.user.id]}],
											function(e, results) {
						log.d("Arguments:", arguments);
						results.forEach(function(result) {
							log("User: ", user.user.description, result.rows[0].description);
							assert.equal(result.rows[0].description, user.user.description, "updating description failed");
						});
						cb();
						done();
					});
				});
			});

		});
	});

	it("storing new Room.", function(done) {
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		utils.emitActions( core, [user], function() {
			utils.emitActions(core, [room], function() {
				pg.connect(connString, function(err, client, cb) {
					postgres.runQueries(client,
											[{query: "SELECT * from entities where id=$1", values: [room.room.id]},
											 {query: "SELECT * from relations where \"room\"=$1 AND \"user\"=$2", values: [room.room.id, room.user.id]}],
											function(e, results) {
						log.d("Arguments:", arguments);
						//results.forEach(function(result) {
						assert.deepEqual(results[0].rows[0].id, room.room.id, "Adding new room failed");
						assert.equal(results[1].rows[0].role, "owner", "room user relation is not correct.");
						//});
						cb();
						done();
					});
				});
			});
		});
	});

	it("Update room.", function(done) {
		this.timeout(3000);
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		var roomOwner = utils.getNewUserAction();
		room.user = roomOwner.user;
		utils.emitActions(core, [user, roomOwner], function() {
			core.emit("room", room, function() {
				var old = utils.copy(room.room);
				room.user = user.user;
				room.old = old;
				room.room.description = generate.sentence(32);
				room.room.identities = room.room.identities.splice(0, 1);
				core.emit("room", room, function() {
					pg.connect(connString, function(err, client, cb) {
						postgres.runQueries(client,
												[{query: "SELECT * from entities where id=$1", values: [room.room.id]}],
												function(e, results) {
							log.d("Arguments:", arguments);
							results.forEach(function(result) {
								room.room.identities.sort();
								var identResults = [];
								result.rows[0].identities.forEach(function(identity) {
									identResults.push(identity[1]);
								});
								identResults.sort();
								room.room.identities.sort();
								assert.deepEqual(identResults, room.room.identities, "updating identites failed");
								assert.equal(result.rows[0].description, room.room.description, "updating description failed");
							});
							cb();
							done();
						});
					});
				});

			});
		});
	});

	it("Join room.", function(done) {
		var relation = utils.getNewRelationAction('join', 'follower');
		var user = utils.getNewUserAction();
		var room = utils.getNewRoomAction();
		user.user = relation.user;
		room.room = relation.room;
		var roomOwner = utils.getNewUserAction();
		room.user = roomOwner.user;
		utils.emitActions(core, [user, roomOwner], function() {
			core.emit("room", room, function() {
				core.emit("join", relation, function() {
					log("Join :", arguments);
					pg.connect(connString, function(err, client, cb) {
						postgres.runQueries(client,
												[{query: "SELECT * from relations where \"room\"=$1 and \"user\"=$2",
												  values: [room.room.id, user.user.id]}],
												function(e, results) {
							log.d("Arguments:", arguments);
							results.forEach(function(result) {
								log("Result:", result);
								assert.equal(result.rows[0].room, room.room.id, "join message insert failed");
							});
							cb();
							done();
						});
					});
				});
			});
		});
	});

	it("part room.", function(done) {
		var relation = utils.getNewRelationAction('join', 'follower');
		var user = utils.getNewUserAction();
		var room = utils.getNewRoomAction();

		user.user = relation.user;
		room.room = relation.room;
		var roomOwner = utils.getNewUserAction();
		room.user = roomOwner.user;
		utils.emitActions(core, [user, roomOwner], function() {
			core.emit("room", room, function() {
				room.user = user.user;
				core.emit("join", relation, function() {
					relation.role = 'none';
					relation.time = new Date().getTime();
					core.emit("part", relation, function() {
						pg.connect(connString, function(err, client, cb) {
							postgres.runQueries(client,
													[{query: "SELECT * from relations where \"room\"=$1 and \"user\"=$2",
													  values: [room.room.id, user.user.id]}],
													function(e, results) {
								log.d("Arguments:", arguments);
								results.forEach(function(result) {
									log("Result:", result);
									assert.equal(result.rows[0].role, 'none', "part message failed");
									assert.equal(result.rows.length, 1, "Multiple rows");
								});
								cb();
								done();
							});
						});
					});
				});
			});
		});
	});

});

