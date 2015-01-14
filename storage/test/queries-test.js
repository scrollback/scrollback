/* jshint mocha: true */
var assert = require('assert'),
	utils = require('./utils.js'),
	core = new (require('ebus'))(),
	mathUtils = require('../../lib/mathUtils.js'),
	generate = require("../../lib/generate.js"),
	log = require("../../lib/logger.js"),
	storage = require('./../storage.js'),
	config = require('./../../server-config-defaults.js'),
	pg = require('pg');
	config.storage.pg.db = "testingdatabase"; // don't change this.
var	connString = "pg://" + config.storage.pg.username + ":" +
	config.storage.pg.password + "@" + config.storage.pg.server + "/" + config.storage.pg.db;


describe("Storage Test.", function() {
	before(function(done) {
		storage(config.storage, core);
		if (config.env === 'production') {
			log.w("Can not run test cases in production.");
			return;
		}
		setTimeout(done, 1500);
	});
	
	beforeEach(function(done) {
		log("Before each");
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
	
	it("getRooms query (ref)", function(done) {
		var room = utils.getNewRoomAction();
		core.emit("user", room, function() {
			core.emit("getRooms", {type: 'getRooms', ref: room.room.id}, function(err, reply) {
				log.d("Arguments:", arguments);
				assert.equal(reply.results.length, 1, "Not one result");
				assert.equal(reply.results[0].id, room.room.id, "Get room failed");
				done();
			});
		});
	});
	
	it("getRooms query (identities)", function(done) {
		var room = utils.getNewRoomAction();
		log.d("Room:", room);
		core.emit("user", room, function() {
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
	
	it("getRooms query (identities)", function(done) {
		var room = utils.getNewRoomAction();
		log.d("Room:", room);
		core.emit("user", room, function() {
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
	
	it("getUsers query (timezone)", function(done) {
		var users = [];
		var t1 = mathUtils.random(-10, 5) * 60;
		var t2 = mathUtils.random(7, 12) * 60;
		var n = mathUtils.random(5, 10);
		for (var i = 0;i < n;i++) {
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
			}, function(err, reply) {
				log.d("N=", n, reply.results.length);
				assert.equal(reply.results.length >= n, true, "Timezone query failed"); // TODO write a better assertion.
				done();
			});
		});
	});
	
	it("getUsers query (memberOf)", function(done) {
		var relations = [];
		var users = [];
		var room = utils.getNewRoomAction();
		var n = mathUtils.random(1, 10);
		for (var i = 0;i < n; i++) {
			relations.push(utils.getNewRelationAction('join', 'follower'));
			var user = utils.getNewUserAction();
			relations[i].user = user.user;
			relations[i].room = room.room;
			users.push(user);
		}
		utils.emitActions(core, [room] , function(err1, results1) {
			utils.emitActions(core, users, function(err2, results2) {
				utils.emitActions(core, relations, function(err3, results3) {
					log.d("actions: ", err1, err2, err3, results1, results2, results3);
					core.emit("getUsers", {
						type: 'getUsers',
						memberOf: room.room.id
					}, function(err, reply) {
						log.d("N=", n, reply.results.length);
						assert.equal(reply.results.length >= n, true, "member of query failed.");
						done();
					});
				});
			});
			
		});
	});
	
	
	it("getUsers query (hasMember)", function(done) {
		var relations = [];
		var rooms = [];
		var user = utils.getNewUserAction();
		var n = mathUtils.random(1, 10);
		for (var i = 0;i < n; i++) {
			relations.push(utils.getNewRelationAction('join', 'follower'));
			var room = utils.getNewRoomAction();
			relations[i].user = user.user;
			relations[i].room = room.room;
			rooms.push(room);
		}
		utils.emitActions(core, [user] , function(err1, results1) {
			utils.emitActions(core, rooms, function(err2, results2) {
				utils.emitActions(core, relations, function(err3, results3) {
					log.d("actions: ", err1, err2, err3, results1, results2, results3);
					core.emit("getRooms", {
						type: 'getRooms',
						hasMember: user.user.id
					}, function(err, reply) {
						log.d("N=", n, reply.results.length);
						assert.equal(reply.results.length >= n, true, "hasMember query failed.");
						done();
					});
				});
			});

		});
	});
	it("getTexts query (ref)", function(done) {
		var text = utils.getNewTextAction();
		core.emit("text", text, function() {
			core.emit("getTexts", {ref: text.id}, function(err, reply) {
				assert.equal(reply.results[0].id, text.id, "getTexts(ref) not working");
				done();
			});
		});
	});
	
	
	it("getTexts query-1 (time: null / msg: 256 / before)", function(done) {
		this.timeout(10000);
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(1, 256);
		var time = new Date().getTime();
		for (var i = 0; i < n; i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time = time  + i; // increasing time.
			texts.push(text);
		}
		utils.emitActions(core, texts, function() {
			core.emit("getTexts", {time: null, before: 256, to: to}, function(err, results) {
				log.d("Texts:", results);
				assert.equal(results.results.length, n, "not n messages");
				for (var i = 0; i < n; i++) {
					assert.equal(results.results[i].id, texts[i].id, "Incorrect results");
				}
				done();
			});
		});
 	});
	
	it("getTexts query-2 (time: null / msg > 256 / before)", function(done) {
		this.timeout(20000);
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(257, 500);
		var time = new Date().getTime();
		for (var i = 0;i < n;i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time = time + i; // increasing time.
			texts.push(text);
		}
		var num = 256;
		utils.emitActions(core, texts, function() {
			core.emit("getTexts", {time: null, before: num, to: to}, function(err, results) {
				log.d("Texts:", results);
				assert.equal(results.results.length, num, "Number of messages are not 256");
				for (var i = n - num ; i < n; i++) {
					assert.equal(results.results[i - (n - num)].id, texts[i].id, "Incorrect results");
				}
				done();
			});
		});
	});
	
	it("getTexts query-3 (time: number / msg <= 256 / after)", function(done) {
		this.timeout(10000);
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(1, 256);
		var time = new Date().getTime();
		for (var i = 0;i < n;i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time = time  + i; // increasing time.
			texts.push(text);
		}
		utils.emitActions(core, texts, function() {
			core.emit("getTexts", {time: time - 1, after: 256, to: to}, function(err, results) {
				log.d("Texts:", results);
				assert.equal(results.results.length, n, "not n messages");
				for (var i = 0; i < n; i++) {
					assert.equal(results.results[i].id, texts[i].id, "Incorrect results");
				}
				
				done();
			});
		});
	});

	it("getTexts query-4 ((time: number / msg > 256 / after))", function(done) {
		this.timeout(20000);
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(257, 500);
		var time = new Date().getTime();
		for (var i = 0;i < n;i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time = time + i; // increasing time.
			texts.push(text);
		}
		var num = 256;
		utils.emitActions(core, texts, function() {
			core.emit("getTexts", {time: time - 1, after: num, to: to}, function(err, results) {
				log.d("Texts:", results);
				assert.equal(results.results.length, num, "Number of messages are not 256");
				for (var i = 0; i < num; i++) {
					assert.equal(results.results[i].id, texts[i].id, "Incorrect results");
				}
				done();
			});
		});
	});
	
	
	it("getTexts query-5 ((time: number / msg > 256 / after)", function(done) {
		this.timeout(20000);
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(300, 500);
		var time = new Date().getTime();
		for (var i = 0;i < n;i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time = time + i; // increasing time.
			texts.push(text);
		}
		var num = 256;
		var at = mathUtils.random(1, 45);
		utils.emitActions(core, texts, function() {
			core.emit("getTexts", {time: time + at, after: num, to: to}, function(err, results) {
				log.d("Texts:", results);
				assert.equal(results.results.length, num, "Number of messages are not 256");
				for (var i = at; i < num; i++) {
					assert.equal(results.results[i - at].id, texts[i].id, "Incorrect results");
				}
				done();
			});
		});
	});
	
	it("getTexts query-6 ((time: number / msg > 256 / before)", function(done) {
		this.timeout(20000);
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(300, 500);
		var time = new Date().getTime();
		for (var i = 0;i < n;i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time = time + i; // increasing time.
			texts.push(text);
		}
		var num = mathUtils.random(1, 256);
		var at = mathUtils.random(1, 25);
		utils.emitActions(core, texts, function() {
			core.emit("getTexts", {time: time + (n - 1) - at, before: num, to: to}, function(err, results) {
				log.d("Texts:", results);
				assert.equal(results.results.length, num, "Number of messages are not correct");
				for (var i = n - num - at; i < (n - at); i++) {
					//log.d("Results", results.results[i - (n - num - at)].id, texts[i].id, i - (n - num - at), i);
					assert.equal(results.results[i - (n - num - at)].id, texts[i].id, "Incorrect results");
				}
				done();
			});
		});
	});
	
});
