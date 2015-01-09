/* jshint mocha: true */
var assert = require('assert'),
	utils = require('./utils.js'),
	core = new (require('ebus'))(),
	mathUtils = require('../../lib/mathUtils.js'),
	//generate = require("../../lib/generate.js"),
	//storageUtils = require('./../storage-utils.js'),
	log = require("../../lib/logger.js"),
	storage = require('./../storage.js'),
	config = require('./../../server-config-defaults.js');
	/*pg = require('pg'),
	connString = "pg://" + config.storage.pg.username + ":" +
	config.storage.pg.password + "@" + config.storage.pg.server + "/" + config.storage.pg.db;*/


describe("Storage Test.", function() {
	before(function(done) {
		storage(config.storage, core);
		if (config.env === 'production') {
			log.w("Can not run test cases in production.");
			return;
		}
		setTimeout(done, 1500);
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
			users[i].timezone = Math.random(t1, t2);
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
				assert.equal(reply.results.length >= n, true, "Timezone query failed");
				done();
			});
		});
	});
	
	
	

});
