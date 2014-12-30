var log = require('./../lib/logger.js');
module.exports = function(client, queries, callback) {
	function rollback(err, client, done) {
		client.query('ROLLBACK', function(err) {
			log.e("Rollback", err);
			return done(err);
		});
	};
	client.query("BEGIN", function(err) {
		if (err) rollback(err, client, callback);
		function run(i) {
			if (i < queries.length) {
				client.query(queries[i].query, queries[i].values, function(err) {
					console.log("arguments run queries:", arguments, queries[i].query);
					if (err) rollback(err, client, callback);
					else run(i + 1);
				});
			} else {
				client.query("COMMIT", callback);
			}
		}
		run(0);
	});
};