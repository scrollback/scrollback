var log = require('./../lib/logger.js');
var runningQueries = {};
var generate = require('./../lib/generate.js');
var shuttingDown = false;

/**
[{ query: string,
values: [],
}, .....]
*/

function runQueries(client, queries, cb) {
	if (queries.length === 0) {
		return callback(null, []);
	}

	if (shuttingDown) {
		return;
	}
	var id = generate.uid();
	runningQueries[id] = client;
	function callback(err, results) {
		delete runningQueries[id];
		cb(err, results);
	}
	client.query("BEGIN", function(err) {
		var results = [];
		for (var i = 0;i < queries.length;i++) {
			results.push(null);
		}
		if (err) rollback(err, client, callback);
		function run(i) {
			if (i < queries.length && !shuttingDown) {
				client.query(queries[i].query, queries[i].values, function(err, result) {
					results[i] =  result;
					if (err) rollback(err, client, callback);
					else run(i + 1);
				});
			} else {
				if (!shuttingDown) {
					client.query("COMMIT", function(err) {
						callback(err, results);
					});
				}
			}
		}
		run(0);
	});
}

function rollback(err, client, done) {
	client.query('ROLLBACK', function(er) {
		log.e("Rollback", err, er);
		return done(err);
	});
}

process.on('SIGINT', onShutDownSignal);
process.on('SIGTERM', onShutDownSignal);

function onShutDownSignal() {
	shuttingDown = true;
	log.w("Process killed, rolling back queries");
	var ct = 1;
	function done() {
		ct--;
		if (ct === 0) {
			log("Complete: shutting down now.");
			process.exit(0);
		}
	}
	for (var key in runningQueries) {
		if (runningQueries.hasOwnProperty(key)) {
			ct++;
			rollback(new Error("error: SIGINT/SIGTERM"), runningQueries[key], done);
		}
	}
	done();
}

module.exports = runQueries;