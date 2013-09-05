var pool = require("../data.js");
var log = require("../../lib/logger.js");

module.exports = function(options, callback) {
	pool.get(function(err, db) {
		var query = "SELECT * FROM `rooms` ",
			where = [], params=[], desc=false, limit=256;
		
		if(err) throw err;
		
		if(options.)
		
		log(query, params);
	});
};