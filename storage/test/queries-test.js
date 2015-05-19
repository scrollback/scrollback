/* eslint-env mocha */
/* eslint no-shadow: 0 */

"use strict";
var assert = require('assert'),
	utils = require('./utils.js'),
	core = new (require('ebus'))(),
	mathUtils = require('../../lib/math-utils.js'),
	generate = require("../../lib/generate.js"),
	log = require("../../lib/logger.js"),
	storage = require('./../storage.js'),
	config = require('./../../server-config-defaults.js'),
	pg = require('pg');
	config.storage.pg.db = "testingdatabase"; // don't change this.
if(process.env.TRAVIS){
	config.storage.pg.server = "direct.stage.scrollback.io";
}
var	connString = "pg://" + config.storage.pg.username + ":" + config.storage.pg.password + "@" + config.storage.pg.server + "/" + config.storage.pg.db;


describe("Storage Test(Queries)", function() {
	before(function(done) {
		storage(core, config.storage);
		if (config.env === 'production') {
			log.w("Can not run test cases in production.");
			return;
		}
		setTimeout(done, 1500);
	});

	beforeEach(function(done) {
		this.timeout(3500);
		log("Before each");
		if (config.env === 'production') {
			log.w("Can not run test cases in production.");
			return;
		}
		pg.connect(connString, function(err, client, cb) {
			if(err) throw err;
			utils.clearTables(client, ['relations', 'entities', 'texts', 'threads'], function() {
				cb();
				done();
			});
		});
	});

	it("getUsers query (ref)", function(done) {
		var user = utils.getNewUserAction();
		core.emit("user", user, function() {
			core.emit("getUsers", {type: 'getUsers', ref: user.user.id}, function(err, reply) {
				log.d("Arguments:", arguments);
				assert.equal(reply.results.length, 1, "Not one result");
				assert.equal(reply.results[0].id, user.user.id, "Get user failed");
				done();
			});
		});
	});

	it("getUsers query (ref is an empty array)", function(done) {
		var user = utils.getNewUserAction();
		core.emit("user", user, function() {
			core.emit("getUsers", {type: 'getUsers', ref: []}, function(err, reply) {
				log.d("Arguments:", arguments);
				assert.equal(reply.results.length, 0, "Not zero result");
				done();
			});
		});
	});

	it("getRooms query (empty results)", function(done) {
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		core.emit("user", user, function() {
			core.emit("room", room, function() {
				core.emit("getRooms", {type: 'getRooms', ref: generate.names(10)}, function(err, reply) {
					log.d("Arguments:", arguments);
					assert.equal(reply.results.length, 0, "Should return 0 results");
					done();
				});
			});
		});
	});

	it("getEntities query", function(done) {
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		core.emit("user", user, function() {
			core.emit("room", room, function() {
				core.emit("getEntities", {type: 'getEntities', ref: [room.room.id, user.user.id]}, function(err, reply) {
					log.d("Arguments:", arguments);
					assert.equal(reply.results.length, 2, "Should return 2 results");
					assert.equal(reply.results[0].id, room.room.id, "wrong room");
					assert.equal(reply.results[1].id, user.user.id, "wrong user");
					done();
				});
			});
		});
	});

	it("getRooms query (ref is an array)", function(done) {
		this.timeout(7000);
		var rooms = [];
		var n = mathUtils.random(2, 100);
		var time = new Date().getTime();
		var user = utils.getNewUserAction();
		var ref = [];
		for (var i = 0; i < n; i++) {
			var room = utils.getNewRoomAction();
			room.user = user.user;
			room.room.createTime = time  + i; // increasing time.
			rooms.push(room);
			if (i % 2 === 0) ref.push(room.room.id); //valid room
			else ref.push(generate.names(10)); //invalid room
		}

		core.emit("user", user, function() {
			utils.emitActions(core, rooms, function() {
				core.emit("getRooms", {type: "getRooms", ref: ref}, function(err, results) {
					assert.equal(results.results.length, n, "not n results");
					for (var i = 0; i < results.results.length; i++) {
						//log.d("results:", (results.results[i] ? results.results[i].id : null), ref[i]);
						var tt1 = (i % 2 === 0) ? rooms[i].room.id : null;
						var tt2 = (i % 2 === 0) ? results.results[i].id : null;
						assert.equal(tt2, tt1, "Incorrect results");
					}
					done();
				});
			});
		});
	});

	it("getRooms query (filled results)", function(done) {
		var room = utils.getNewRoomAction();
		core.emit("getRooms", {type: 'getRooms', ref: room.room.id, results: [room.room]}, function(err, reply) {
			log.d("Arguments:", arguments);
			assert.equal(reply.results.length, 1, "Should return 0 results");
			done();
		});
	});


	it("getRooms query (ref)", function(done) {
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		core.emit("user", user, function() {
			core.emit("room", room, function() {
				core.emit("getRooms", {type: 'getRooms', ref: room.room.id}, function(err, reply) {
					log.d("Arguments:", arguments);
					assert.equal(reply.results.length, 1, "Not one result");
					assert.equal(reply.results[0].id, room.room.id, "Get room failed");
					done();
				});
			});
		});
	});

	it("getRooms query (identities)", function(done) {
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		core.emit("user", user, function() {
			core.emit("room", room, function() {
				var identity = room.room.identities[0];
				log("Identity:", identity);
				core.emit("getRooms", {type: 'getRooms', identity: identity.substr(0, identity.indexOf(":"))}, function(err, reply) {
					log.d("Arguments:", arguments);
					assert.equal(reply.results.length, 1, "Not one result");
					assert.equal(reply.results[0].id, room.room.id, "Get room failed");
					done();
				});
			});
		});
	});

	it("getRooms query (identity, params, guides)", function(done) {
		this.timeout(3000);
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		core.emit("user", user, function() {
			core.emit("room", room, function() {
				var updatedRoom = utils.copy(room);
				updatedRoom.old = room.room;
				updatedRoom.room.description =  generate.sentence(14);
				updatedRoom.room.params = {
					test: { test1: 1}
				};
				updatedRoom.room.identities = [generate.names(6) + "://" + generate.names(10), generate.names(5) + "://" + generate.names(10)];
				updatedRoom.room.timezone = mathUtils.random(0, 24) * 30;
				core.emit("room", updatedRoom, function() {
					core.emit("getRooms", {type: 'getRooms', ref: room.room.id}, function(err, reply) {
						log.d("Arguments:", arguments);
						log.d("room:", room);
						log.d("Updated Room", updatedRoom);
						assert.equal(reply.results.length, 1, "Not one result");
						var identities = updatedRoom.room.identities;
						identities.sort();
						reply.results[0].identities.sort();
						assert.deepEqual(reply.results[0].identities, updatedRoom.room.identities, "room.identities did not match.");
						assert.equal(reply.results[0].description, updatedRoom.room.description, "updation of room failed");
						assert.deepEqual(reply.results[0].params, updatedRoom.room.params, "room.params not saved");
						assert.equal(reply.results[0].timezone, updatedRoom.room.timezone, 'room.timezone updation failed');
						done();
					});
				});
			});
		});
	});


	it("getRooms query (identities)", function(done) {
		var room = utils.getNewRoomAction();
		var user = utils.getNewUserAction();
		room.user = user.user;
		core.emit("user", user, function() {
			core.emit("room", room, function() {
				var identity = room.room.identities[0];
				log("Identity:", identity);
				core.emit("getRooms", {type: 'getRooms', identity: identity}, function(err, reply) {
					log.d("Arguments:", arguments);
					assert.equal(reply.results.length, 1, "Not one result");
					assert.equal(reply.results[0].id, room.room.id, "Get room failed");
					done();
				});
			});
		});
	});

	it("getUsers query (timezone)", function(done) {
		var users = [];
		var t1 = mathUtils.random(-10, 5) * 60;
		var t2 = mathUtils.random(7, 12) * 60;
		var n = mathUtils.random(5, 10);
		for (var i = 0; i < n; i++) {
			users.push(utils.getNewUserAction());
			users[i].user.timezone = mathUtils.random(t1, t2);
		}
		utils.emitActions(core, users, function(err, results) {
			log.d("actions: ", err, results);
			core.emit("getUsers", {
				type: 'getUsers',
				timezone: {
					gte: t1,
					lte: t2
				}
			}, function(err1, reply) {
				log.d("N=", n, reply.results.length);
				assert.equal(reply.results.length >= n, true, "Timezone query failed"); // TODO write a better assertion.
				done();
			});
		});
	});

	it("getUsers query (memberOf)", function(done) {
		this.timeout(3000);
		var relations = [];
		var users = [];
		var room = utils.getNewRoomAction();
		var roomOwner = utils.getNewUserAction();
		room.user = roomOwner.user;
		var n = mathUtils.random(5, 15);
		var type, v;
		var bannedCount = 0;
		for (var i = 0; i < n; i++) {
			if (i % 3 === 0) {
				type = 'expel';
				v = 'banned';
				bannedCount++;
			} else {
				type = 'join';
				v = 'follower';
			}
			relations.push(utils.getNewRelationAction(type, v));
			var user = utils.getNewUserAction();
			if (i % 3 === 0) {
				relations[i].victim = user.user;
			} else {
				relations[i].user = user.user;
			}
			relations[i].room = room.room;
			users.push(user);
		}
		core.emit("user", roomOwner, function() {
			utils.emitActions(core, [room] , function(err1, results1) {
				utils.emitActions(core, users, function(err2, results2) {
					utils.emitActions(core, relations, function(err3, results3) {
						log.d("actions: ", err1, err2, err3, results1, results2, results3);
						core.emit("getUsers", {
							type: 'getUsers',
							memberOf: room.room.id
						}, function(err, reply) {
							log.d("N=", n, reply.results.length);

							assert.equal(reply.results.length, n - bannedCount + 1, "member of query failed.");
							done();
						});
					});
				});

			});
		});
	});

	it("getUsers query (ref and memberOf role: none)", function(done) {
		var users = [];
		var room = utils.getNewRoomAction();
		var roomOwner = utils.getNewUserAction();
		room.user = roomOwner.user;
		var n = mathUtils.random(1, 10);
		for (var i = 0; i < n; i++) {
			var user = utils.getNewUserAction();
			users.push(user);
		}
		var index = mathUtils.random(0, n - 1);
		core.emit("user", roomOwner, function() {
			utils.emitActions(core, [room] , function(err1, results1) {
				utils.emitActions(core, users, function(err2, results2) {
					log.d("actions: ", err1, err2, results1, results2);
					core.emit("getUsers", {
						type: 'getUsers',
						ref: users[index].user.id,
						memberOf: room.room.id
					}, function(err, reply) {
						log.d("N=", 0, reply.results.length);
						assert.equal(reply.results.length, 0, "member of query failed.");
						done();
					});

				});

			});
		});
	});

	it("getUsers query (memberOf and ref)", function(done) {
		this.timeout(3000);
		var relations = [];
		var users = [];
		var room = utils.getNewRoomAction();
		var roomOwner = utils.getNewUserAction();
		room.user = roomOwner.user;
		var n = mathUtils.random(1, 10);
		for (var i = 0; i < n; i++) {
			relations.push(utils.getNewRelationAction('join', 'follower'));
			var user = utils.getNewUserAction();
			relations[i].user = user.user;
			relations[i].room = room.room;
			users.push(user);
		}
		var index = mathUtils.random(0, n - 1);
		core.emit("user", roomOwner, function() {
			utils.emitActions(core, [room] , function(err1, results1) {
				utils.emitActions(core, users, function(err2, results2) {
					utils.emitActions(core, relations, function(err3, results3) {
						log.d("actions: ", err1, err2, err3, results1, results2, results3);
						core.emit("getUsers", {
							type: 'getUsers',
							ref: users[index].user.id,
							memberOf: room.room.id
						}, function(err, reply) {
							log.d("N=", n, reply.results.length);
							assert.equal(reply.results.length, 1, "member of query failed.");
							assert.equal(reply.results[0].id, users[index].user.id, "Not same user");
							assert.equal(reply.results[0].role, "follower", "User is not a follower");
							done();
						});
					});
				});

			});
		});
	});

	it("getUsers query (hasMember)", function(done) {
		this.timeout(3000);
		var relations = [];
		var rooms = [];
		var user = utils.getNewUserAction();
		var n = mathUtils.random(1, 10);
		var roomOwner = utils.getNewUserAction();
		for (var i = 0; i < n; i++) {
			relations.push(utils.getNewRelationAction('join', 'follower'));
			var room = utils.getNewRoomAction();
			room.user = roomOwner.user;
			relations[i].user = user.user;
			relations[i].room = room.room;
			rooms.push(room);
		}
		utils.emitActions(core, [user, roomOwner] , function(err1, results1) {
			utils.emitActions(core, rooms, function(err2, results2) {
				utils.emitActions(core, relations, function(err3, results3) {
					log.d("actions: ", err1, err2, err3, results1, results2, results3);
					core.emit("getRooms", {
						type: 'getRooms',
						hasMember: user.user.id
					}, function(err, reply) {
						log.d("N=", n, reply.results.length);
						assert.equal(reply.results.length, n, "hasMember query failed.");
						done();
					});
				});
			});

		});
	});



	it("getUsers query (hasMember and ref as an array)", function(done) {
		this.timeout(3000);
		var relations = [];
		var rooms = [];
		var user = utils.getNewUserAction();
		var n = mathUtils.random(1, 10);
		var roomOwner = utils.getNewUserAction();
		var ref = [];
		for (var i = 0; i < n; i++) {
			relations.push(utils.getNewRelationAction('join', 'follower'));
			var room = utils.getNewRoomAction();
			room.user = roomOwner.user;
			relations[i].user = user.user;
			relations[i].room = room.room;
			if (i % 2 === 0) {
				ref.push(room.room.id);
			}
			rooms.push(room);
		}
		utils.emitActions(core, [user, roomOwner] , function(err1, results1) {
			utils.emitActions(core, rooms, function(err2, results2) {
				utils.emitActions(core, relations, function(err3, results3) {
					log.d("actions: ", err1, err2, err3, results1, results2, results3);
					core.emit("getRooms", {
						type: 'getRooms',
						hasMember: user.user.id,
						ref: ref
					}, function(err, reply) {
						log.d("N=", n, reply.results.length, reply.results);
					assert.equal(reply.results.length,ref.length , "hasMember query failed.");
						reply.results.forEach(function(rm, j) {
						assert.equal(rm.id, ref[j], "not equal");
						});
						done();
					});
				});
			});

		});
	});


	it("getUsers query (hasMember and ref)", function(done) {
		this.timeout(3000);
		var relations = [];
		var rooms = [];
		var user = utils.getNewUserAction();
		var n = mathUtils.random(3, 10);
		var roomOwner = utils.getNewUserAction();
		for (var i = 0; i < n; i++) {
			relations.push(utils.getNewRelationAction('join', 'follower'));
			var room = utils.getNewRoomAction();
			room.user = roomOwner.user;
			relations[i].user = user.user;
			relations[i].room = room.room;
			rooms.push(room);
		}
		var index = mathUtils.random(0, n - 1);
		utils.emitActions(core, [user, roomOwner] , function(err1, results1) {
			utils.emitActions(core, rooms, function(err2, results2) {
				utils.emitActions(core, relations, function(err3, results3) {
					log.d("actions: ", err1, err2, err3, results1, results2, results3);
					core.emit("getRooms", {
						type: 'getRooms',
						hasMember: user.user.id,
						ref: rooms[index].room.id
					}, function(err, reply) {
						log.d("N, length=", n, reply.results.length, reply.results);
						assert.equal(reply.results.length, 1, "hasMember query failed.");
						assert.equal(reply.results[0].id, rooms[index].room.id, "Incorrect room");
						assert.equal(reply.results[0].role, "follower", "Incorrect role");
						done();
					});
				});
			});

		});
	});


	it("getTexts query (ref)", function(done) {
		var text = utils.getNewTextAction();
		core.emit("text", text, function() {
			core.emit("getTexts", {type: "getTexts", ref: text.id}, function(err, reply) {
				assert.equal(reply.results[0].id, text.id, "getTexts(ref) not working");
				done();
			});
		});
	});

//	it("getTexts query (ref is an empty array)", function(done) {
//		var text = utils.getNewTextAction();
//		core.emit("text", text, function() {
//			core.emit("getTexts", {type: "getTexts", ref: []}, function(err, reply) {
//				assert.equal(reply.results.length, 0, "array length is not zero");
//				done();
//			});
//		});
//	});
//
//	it("getTexts query-(ref is an array)", function(done) {
//		this.timeout(10000);
//		var texts = [];
//		var n = mathUtils.random(1, 256);
//		var time = new Date().getTime();
//		var ref = [];
//		var t = mathUtils.random(1, 2) + 1;
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.time = time  + i; // increasing time.
//			texts.push(text);
//			if (i % t === 0) ref.push(generate.uid());
//			else ref.push(text.id);
//		}
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", ref: ref}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, n, "not n messages");
//				for (var i = 0; i < n; i++) {
//					var a1 = (i % t === 0 ? null : texts[i].id);
//					var a2 = (i % t === 0 ? null : results.results[i].id);
//					assert.equal(a2, a1, "Incorrect results");
//				}
//				done();
//			});
//		});
//	});
//
//
//	it("getTexts query-1 (time: null / msg: 256 / before)", function(done) {
//		this.timeout(10000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(1, 256);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time  + i; // increasing time.
//			texts.push(text);
//		}
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", time: null, before: 256, to: to}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, n, "not n messages");
//				for (var i = 0; i < n; i++) {
//					assert.equal(results.results[i].id, texts[i].id, "Incorrect results");
//				}
//				done();
//			});
//		});
// 	});
//
//	it("getTexts query-2 (time: null / msg > 256 / before)", function(done) {
//		this.timeout(25000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(257, 500);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time + i; // increasing time.
//			texts.push(text);
//		}
//		var num = 256;
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", time: null, before: num, to: to}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, num, "Number of messages are not 256");
//				for (var i = n - num; i < n; i++) {
//					assert.equal(results.results[i - (n - num)].id, texts[i].id, "Incorrect results");
//				}
//				done();
//			});
//		});
//	});
//
//	it("getTexts query-3 (time: number / msg <= 256 / after)", function(done) {
//		this.timeout(10000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(1, 256);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time  + i; // increasing time.
//			texts.push(text);
//		}
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", time: time - 1, after: 256, to: to}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, n, "not n messages");
//				for (var i = 0; i < n; i++) {
//					assert.equal(results.results[i].id, texts[i].id, "Incorrect results");
//				}
//
//				done();
//			});
//		});
//	});
//
//	it("getTexts query-4 ((time: number / msg > 256 / after))", function(done) {
//		this.timeout(20000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(257, 500);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time + i; // increasing time.
//			texts.push(text);
//		}
//		var num = 256;
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", time: time - 1, after: num, to: to}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, num, "Number of messages are not 256");
//				for (var i = 0; i < num; i++) {
//					//log.d("values:", results.results[i].id, texts[i].id);
//					assert.equal(results.results[i].id, texts[i].id, "Incorrect results");
//				}
//				done();
//			});
//		});
//	});
//
//
//	it("getTexts query-5 ((time: number / msg > 256 / after)", function(done) {
//		this.timeout(20000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time + i; // increasing time.
//			texts.push(text);
//		}
//		var num = 256;
//		var at = mathUtils.random(1, 45);
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", time: time + at, after: num, to: to}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, num, "Number of messages are not 256");
//				for (var i = at; i < num; i++) {
//					assert.equal(results.results[i - at].id, texts[i].id, "Incorrect results");
//				}
//				done();
//			});
//		});
//	});
//
//	it("getTexts query-6 ((time: number / msg > 256 / before)", function(done) {
//		this.timeout(20000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time + i; // increasing time.
//			texts.push(text);
//		}
//		var num = mathUtils.random(1, 256);
//		var at = mathUtils.random(1, 25);
//		utils.emitActions(core, texts, function() {
//			core.emit("getTexts", {type: "getTexts", time: time + (n - 1) - at, before: num, to: to}, function(err, results) {
//				log.d("Texts:", results);
//				assert.equal(results.results.length, num, "Number of messages are not correct");
//				for (var i = n - num - at; i < (n - at); i++) {
//					//log.d("Results", results.results[i - (n - num - at)].id, texts[i].id, i - (n - num - at), i);
//					assert.equal(results.results[i - (n - num - at)].id, texts[i].id, "Incorrect results");
//				}
//				done();
//			});
//		});
//	});
//
//	it("getTexts query-7 ((time: number / msg > 256 / before) iterator.", function(done) {
//		this.timeout(20000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time + i; // increasing time.
//			texts.push(text);
//		}
//		var num = mathUtils.random(1, 256);
//		utils.emitActions(core, texts, function() {
//			function getTexts(tim, index) {
//
//				core.emit("getTexts", {type: "getTexts", time: tim, before: num, to: to}, function(err, results) {
//					log.d("Texts:", results);
//					//assert.equal(results.results.length, num, "Number of messages are not correct");
//					for (var i = results.results.length - 1; i >= 0; i--) {
//						//log.d("Results:", results.results[i].id, texts[index].id, index);
//						assert.equal(results.results[i].id, texts[index--].id, "Incorrect results");
//					}
//					if (results.results.length !== num) {
//						done();
//					} else getTexts(results.results[0].time, index + 1);
//				});
//			}
//			getTexts(null, n - 1);
//
//		});
//	});
//
//	// Iterator getRooms/getUsers
//
//	it("getRooms query iterator-1 (create time/after)", function(done) {
//		this.timeout(15000);
//		var rooms = [];
//		var n = mathUtils.random(1, 256);
//		var time = new Date().getTime();
//		var user = utils.getNewUserAction();
//		for (var i = 0; i < n; i++) {
//			var room = utils.getNewRoomAction();
//			room.user = user.user;
//			room.room.createTime = time  + i; // increasing time.
//			rooms.push(room);
//		}
//		core.emit("user", user, function() {
//			utils.emitActions(core, rooms, function() {
//				core.emit("getRooms", {type: "getRooms", createTime: time - 1, after: 256}, function(err, results) {
//					log.d("rooms:", results.results.length, n);
//
//					assert.equal(results.results.length, n, "not n rooms");
//					for (var i = 0; i < n; i++) {
//						assert.equal(results.results[i].id, rooms[i].room.id, "Incorrect results");
//					}
//					done();
//				});
//			});
//		});
//	});
//
//	it("getRooms query iterator-2 (create time / before)", function(done) {
//		this.timeout(15000);
//		var rooms = [];
//		var n = mathUtils.random(1, 256);
//		var time = new Date().getTime();
//		var user = utils.getNewUserAction();
//		for (var i = 0; i < n; i++) {
//			var room = utils.getNewRoomAction();
//			room.user = user.user;
//			room.room.createTime = time  + i; // increasing time.
//			rooms.push(room);
//		}
//		core.emit("user", user, function() {
//			utils.emitActions(core, rooms, function() {
//				core.emit("getRooms", { type: "getRooms", createTime: time + n + 2, before: 256}, function(err, results) {
//					log.d("rooms:", results);
//
//					assert.equal(results.results.length, n, "not n messages");
//					for (var i = 0; i < n; i++) {
//						assert.equal(results.results[i].id, rooms[i].room.id, "Incorrect results");
//					}
//					done();
//				});
//			});
//		});
//	});
//
//	it("getRooms query iterator-3 (create time / before) more then 256", function(done) {
//		this.timeout(20000);
//		var rooms = [];
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		var user = utils.getNewUserAction();
//		for (var i = 0; i < n; i++) {
//			var room = utils.getNewRoomAction();
//			room.user = user.user;
//			room.room.createTime = time  + i; // increasing time.
//			rooms.push(room);
//		}
//		var num = 256;
//		core.emit("user", user, function() {
//			utils.emitActions(core, rooms, function() {
//				core.emit("getRooms", {type: "getRooms", createTime: time + n + 2, before: num}, function(err, results) {
//					log.d("rooms:", results);
//
//					assert.equal(results.results.length, num, "not n messages");
//					for (var i = 0; i < results.results.length; i++) {
//						assert.equal(results.results[i].id, rooms[i + (n - num)].room.id, "Incorrect results");
//					}
//					done();
//				});
//			});
//		});
//	});
//
//	it("getRooms query iterator-4 (create time / after) more then 256", function(done) {
//		this.timeout(20000);
//		var rooms = [];
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		var user = utils.getNewUserAction();
//		for (var i = 0; i < n; i++) {
//			var room = utils.getNewRoomAction();
//			room.user = user.user;
//			room.room.createTime = time  + i; // increasing time.
//			rooms.push(room);
//		}
//		var num = 256;
//		core.emit("user", user, function() {
//			utils.emitActions(core, rooms, function() {
//				core.emit("getRooms", {type: "getRooms", createTime: time - 1, after: num}, function(err, results) {
//					log.d("rooms:", results);
//
//					assert.equal(results.results.length, num, "not n messages");
//					for (var i = 0; i < results.results.length; i++) {
//						//log.d("create room", results.results[i].id + "," + rooms[i].room.id);
//						assert.equal(results.results[i].id, rooms[i].room.id, "Incorrect results");
//					}
//					done();
//				});
//			});
//		});
//	});
//
//
//	it("getRooms query iterator-5 (identities / after) more then 256", function(done) {
//		this.timeout(20000);
//		var rooms = [];
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		var user = utils.getNewUserAction();
//		for (var i = 0; i < n; i++) {
//			var room = utils.getNewRoomAction();
//			room.user = user.user;
//			room.room.createTime = time  + i; // increasing time.
//			room.room.identities.push("twitter://" + generate.names(15));
//			rooms.push(room);
//		}
//		var num = 256;
//		rooms.sort(function(r1, r2) {
//			return r1.room.id > r2.room.id ? 1 : (r1.room.id === r2.room.id ? 0 : -1);
//		});
//		core.emit("user", user, function() {
//			utils.emitActions(core, rooms, function() {
//				core.emit("getRooms", {identity: "twitter"}, function(err, results) {
//					log.d("rooms:", results.results.length);
//
//					assert.equal(results.results.length, num, "not n messages");
//					for (var i = 0; i < results.results.length; i++) {
//						//log.d("create room", results.results[i].id + "," + rooms[i].room.id);
//						assert.equal(results.results[i].id, rooms[i].room.id, "Incorrect results");
//					}
//					done();
//				});
//			});
//		});
//	});
//
//
//	it("getThreads query-1 ((time: null / before) iterator.", function(done) {
//		this.timeout(20000);
//		var texts = [];
//		var to = generate.names(8);
//		var n = mathUtils.random(300, 500);
//		var time = new Date().getTime();
//		var numThreads = mathUtils.random(5, 20);
//		var threadIds = [];
//		for (var i = 0; i < n; i++) {
//			var text = utils.getNewTextAction();
//			text.to = to;
//			text.time = time + i; // increasing time.
//			texts.push(text);
//			if (i < numThreads) {
//				threadIds.push(text.threads[0].id);
//			} else {
//				text.threads = [{id: threadIds[i % numThreads]}];
//			}
//		}
//		var num = mathUtils.random(1, 256);
//		utils.emitActions(core, texts, function(err) {
//			if (err) log.e("getThreads:", err);
//			assert.ok(!err, "Error while saving texts");
//			core.emit("getThreads", {type: "getThreads", time: time - 1, after: num, to: to}, function(errr, results) {
//				log.d("Texts:", results);
//				log.d("Length: ", results.results.length, numThreads);
//				assert.equal(results.results.length, numThreads, "Number of threads are not correct");
//				for (var i = 0; i < results.results.length; i++) {
//					//log.d("Results:", results.results[i].id, threadIds[i]);
//					assert.equal(results.results[i].id, threadIds[i], "Incorrect results");
//				}
//				done();
//			});
//		});
//	});


});
