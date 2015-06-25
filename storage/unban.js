"use strict";
var pg = require("pg");
var log = require("../lib/logger.js");

function unban(config) {
	var connString = "pg://" + config.pg.username + ":" +
		config.pg.password + "@" + config.pg.server + "/" + config.pg.db;


	pg.connect(connString, function(error, client, done) {
		var query = "update relations set " +
			"role = transitionrole," +
			"transitionrole = 'none'," +
			"transitiontime = null," +
			"transitiontype = null " +
			"where transitiontime<CURRENT_TIMESTAMP and transitiontype='timeout';";
		if (error) {
			log.e("Unable to connect to " + connString, error);
			done();
			return;
		}

		client.query(query, function(err) {
			if (err) {
				log.e("Query failed", err.message, query);
				done();
				return;
			}
			log.i("Unban done");
			done();
		});
	});
}

/*
	query:	update relations set role = transitionrole, transitionrole = 'none',transitiontime=null where transitiontime<'2015-06-26 12:13:00.231';
	
*/
module.exports = function(core, config) {
	setTimeout(unban, 60000, config);
};
