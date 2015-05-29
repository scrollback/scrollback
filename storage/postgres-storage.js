"use strict";

var pg = require('pg'),
	log = require('../lib/logger.js'),
	config, conString, 
	postgres = require('./postgres.js');

module.exports = function(conf) {
	config = conf;
	conString = "pg://" + config.pg.username + ":" +
		config.pg.password + "@" + config.pg.server + "/" + config.pg.db;
	
	function get (q, cb) {
		var queries = postgres.transformsToQuery(q);
		pg.connect(getConnectionString(q.source), function(error, client, done) {
			if (error) {
				log("Unable to get Pool Connection Object: ", error, q);
				return cb(error);
			}
			postgres.runQueries(client, queries, function(err, replies) {
				done();
				cb(err, replies);
			});
		});
	}
	
	function put (q, cb) {
		var queries = postgres.transformsToQuery(q);
		pg.connect(getConnectionString(q.source), function(error, client, done) {
			if (error) {
				log("Unable to get Pool Connection Object: ", error, q);
				return cb(error);
			}
			postgres.runQueries(client, queries, function(err) {
				done();
				cb(err);
			});
		});
	}
	
	return { get: get, put: put};
	
};

/*
	["col"
*/

function getConnectionString(/*source*/) {
	return conString;
	/*switch (source) {
			case 'texts':
			case 'threads':
				return conf.db.content;
			default:
				return conf.db.entity;
		}*/
}

