/* jshint mocha: true */
var assert = require('assert'),
	utils = require('./utils.js'),
	crypto = require('crypto'),
	core =new (require('ebus'))(),
	generate = require("../../lib/generate.js"),
	storageUtils = require('./../storage-utils.js'),
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
	
	it("Get text query", function(done) {
		core.emit("getUsers",{ref: 'adhfjksafdjs'}, function() {
			log("Arguments:", arguments);
			done();
		});
	});
	

});
