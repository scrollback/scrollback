/* jshint mocha: true */
var assert = require('assert'),
	crypto = require('crypto'),
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
	
	it("Insert new text message. (Labels and tags)", function(done) {
		var msg = getNewTextMessage();
		msg.labels.abusive = 1;
		msg.labels.hidden = 1;
		msg.tags = ['abc'];
		core.emit("text", msg, function() {
			log("inserted message");
			pg.connect(connString, function(err, client, cb) {
				storageUtils.runQueries(client, 
										[{query: "SELECT * from texts where id=$1", values: [msg.id]}], 
										function(err, results) {
					log.d("Arguments:", arguments);
					results.forEach(function(result) {
						result.rows[0].tags.sort();
						assert.deepEqual(result.rows[0].tags, ['abc', 'color3', 'abusive', 'hidden'].sort(), "tags / labels not saved");
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
	
	it("Edit (Edit text)", function(done) {
		var m1 = getNewTextMessage();
		core.emit("text", m1, function() {
			var text = generate.sentence(11);
			var edit = {
				ref: m1.id,
				text: text
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					storageUtils.runQueries(client, 
											[{query: "SELECT * from texts where id=$1", values: [m1.id]}], 
											function(err, results) {
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
	
	it("Edit (Edit title)", function(done) {
		var m1 = getNewTextMessage();
		core.emit("text", m1, function() {
			var text = generate.sentence(11);
			var edit = {
				ref: m1.id,
				title: text
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					storageUtils.runQueries(client, 
											[{query: "SELECT * from threads where id=$1", values: [m1.id]}], 
											function(err, results) {
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
	
	it("Edit (labels text)", function(done) {
		var m1 = getNewTextMessage();
		m1.labels.abusive = 1;
		m1.labels.hidden = 1;
		core.emit("text", m1, function() {
			var edit = {
				ref: m1.id,
				labels: {abusive: 1, color3: 1}
			};
			core.emit("edit", edit, function() {
				pg.connect(connString, function(err, client, cb) {
					storageUtils.runQueries(client, 
											[{query: "SELECT * from texts where id=$1", values: [m1.id]}], 
											function(err, results) {
						log.d("Arguments:", arguments);
						results.forEach(function(result) {
							assert.deepEqual(result.rows[0].tags, ['abusive', 'color3'], "Updating text failed");
						});
						cb();
						done();
					});
				});
			});
		});
	});	
	
	it("storing new user.", function(done) {
		var user = getNewUser();
		core.emit("user", user, function(){
			pg.connect(connString, function(err, client, cb) {
				storageUtils.runQueries(client, 
										[{query: "SELECT * from entities where id=$1", values: [user.user.id]}], 
										function(err, results) {
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
		labels: {},
		threads: [{id: id + (3), title: generate.sentence(15)}],
		time: new Date().getTime()
	};
}

function getNewUser() {
	var email = generate.names(15) + "@" + generate.names(6) +"." + generate.names(2);
	return {
		id: generate.uid(),
		type:"user",
		user: {
			id:generate.names(8),
			description:"this is me?",
			type:"user",
			timezone: 0,
			picture: generatePick(email),
			identities:["mailto:"+email], 
			params:{},
			guides: {}
		}
	};
}

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=identicon&s=48';
}
