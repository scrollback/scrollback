/* jshint mocha: true */
var assert = require('assert'),
	utils = require('./utils.js'),
	core = new (require('ebus'))(),
	mathUtils = require('../../lib/mathUtils.js'),
	//generate = require("../../lib/generate.js"),
	log = require("../../lib/logger.js"),
	storage = require('./../storage.js'),
	config = require('./../../server-config-defaults.js'),
	pg = require('pg'),
	connString = "pg://" + config.storage.pg.username + ":" +
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
		core.emit("text", text, function(/*err, r*/) {
			core.emit("getTexts", {ref: text.id}, function(err, reply) {
				assert.equal(reply.results[0].id, text.id, "getTexts(ref) not working");
				done();
			});
		});
	});
	
	
	/*it("getTexts query", function(done) {
		var texts = [];
		var to = generate.names(8);
		var n = mathUtils.random(1, 250);
		for (var i = 0;i < n;i++) {
			var text = utils.getNewTextAction();
			text.to = to;
			text.time += i; // increasing time.
			texts.push(text);
		}
		utils.emitActions(core, texts, function(err, results) {
			log("getTexts:", err, results);
			core.emit("getTexts", {time: null, before: 256, to: to}, function(err, results) {
				
			});
		});
 	});*/
});
