var pg = require('pg'),
	log = require('../lib/logger.js'),
	config, conString, 
	storageUtils = require('./storage-utils.js');

module.exports = function(conf) {
	config = conf;
	log.d("config", config);
	conString = "pg://" + config.pg.username + ":" +
		config.pg.password + "@" + config.pg.server + "/" + config.pg.db;
	
	function get (q, cb) {
		log.d("Query:", q);
		var queries = storageUtils.transformsToQuery(q);
		log.d("Queries:", queries);
		pg.connect(getConnectionString(q.source), function(error, client, done) {
			if (error) {
				log("Unable to get Pool Connection Object: ", error, q);
				return cb(error);
			}
			storageUtils.runQueries(client, queries, function(err, replies) {
				log.d("Arguments", arguments);
				done();
				cb(err, replies);
			});
		});
	}
	
	function put (q, cb) {
		var queries = storageUtils.transformsToQuery(q);
		log.d("Queries:", queries);
		pg.connect(getConnectionString(q.source), function(error, client, done) {
			if (error) {
				log("Unable to get Pool Connection Object: ", error, q);
				return cb(error);
			}
			storageUtils.runQueries(client, queries, function(err) {
				log.d("Arguments", arguments);
				done();
				cb(err);
			});
		});
	}
	
	/*function del (q, cb) {
		var sql = ['DELETE FROM'];
		
		if(!q.filters.length) return; // for safety
		sql.push(name(q.source));
		sql = sql.concat(filtersql(q.filters));
		
		pg.connect(getConnectionString(q.source), function(err, client, done) {
			if(err) return cb(err);
			client.query(sql.join(' '), function (err) {
				process.nextTick(function() { cb(err); });
				done();
			});
		});
	}*/
	
	return { get: get, put: put/*, del: del */};
	
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

