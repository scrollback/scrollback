/* jshint mocha: true */
var assert = require('assert'),
	utils = require('./utils.js'),
	core =new (require('ebus'))(),
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
				assert.equal(reply.results[0].id, room.room.id, "Get user failed");
				done();
			});
		});
	});
	

});
