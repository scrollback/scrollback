/* jshint mocha: true */
var assert = require('assert'),
	core =new (require('ebus'))(),
	generate = require("../lib/generate.js"),
	storageUtils = require('./storage-utils.js'),
	log = require("../lib/logger.js"),
	storage = require('./storage.js'),
	config = require('./../server-config-defaults.js'),
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
	
	it("Insert new text message.", function(done) {
		var msg = getNewTextMessage();
		core.emit("text", msg, function() {
			log("inserted message");
			pg.connect(connString, function(err, client, cb) {
				storageUtils.runQueries(client, 
										 [{query: "SELECT * from texts where id=$1", values: [msg.id]},
										  {query: "SELECT * from threads where id=$1", values: [msg.id]}], 
										 function(err, results) {
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
	
	it("Update Thread", function(done) {
		var m1 = getNewTextMessage();
		core.emit("text", m1, function() {
			var m2 = getNewTextMessage();
			m2.threads = m1.threads;
			delete m2.threads[0].title; // don't update title.
			core.emit("text", m2, function() {
				pg.connect(connString, function(err, client, cb) {
					storageUtils.runQueries(client, 
											[{query: "SELECT * from threads where id=$1", values: [m1.id]}], 
											function(err, results) {
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
});
/*

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=identicon&s=48';
}
*/

function getNewTextMessage() {
	var id = generate.uid();
	return {
		id: (id),
		from: generate.names(6),
		to: generate.names(10),
		text: generate.sentence(10),
		threads: [{id: id + (3), title: generate.sentence(15)}],
		time: new Date().getTime()
	};
}