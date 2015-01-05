var log = require('./../lib/logger.js');
module.exports = {
	timetoString: function(time) {
		return (new Date(time).toISOString());
	},
	transformsToQuery: function(transforms) {
		var r = [];
		transforms.forEach(function(transform) {
			r.push(toQuery(transform));
		});
		return r;
	},
	runQueries: runQueries
};

function toQuery(transform) {
	log.d("Transform type: ", transform);
	if (transform.type === 'insert') {
		return makeInsertQuery(transform);
	} else if (transform.type === 'update') {
		return makeUpdateQuery(transform);
	}
}

function makeInsertQuery(transform) {
	var sql = [], names=[], values=[], v = [], i;
	sql.push("INSERT INTO");
	sql.push(transform.source);
	for(i in transform.insert) {
		values.push("$" + (names.length + 1));
		names.push(columnName(i));
		v.push(transform.insert[i]);	
	}
	sql.push("(" + names.join(",") + ") VALUES (" + values.join(",") + ")"); 
	return {
		query: sql.join(" "),
		values: v
	};
}

function columnName(str) {
	return '"' + str.replace('"', '') + '"';
}

function makeUpdateQuery(transform) {
	log.d("update--", transform);
	var sql = [], values = [], i = 1;
	sql.push("UPDATE");
	sql.push(transform.source);
	sql.push("SET");
	var m = [];
	transform.update.forEach(function(update) {
		switch(update[1]) {
			case "set":
				m.push(name(update[0]) + "=$" + i);
				values.push(update[2]);
				i++;
				break;
			case "incr":
				m.push(name(update[0]) + "=" + update[0] + "+" + update[2]);
				break;
		}
	});
	sql.push(m.join(","));
	log.d("sql: ", sql);
	
	var filters = [];
	if (transform.filters && transform.filters.length) {
		sql.push("WHERE");
		transform.filters.forEach(function(filter) {
			var f = [name(filter[0])];
			switch(filter[1]) {
				case 'eq': 	f.push('=');  break;
				case 'neq':	f.push('<>'); break;
				case 'lt':	f.push('<');  break;
				case 'lte':	f.push('<='); break;
				case 'gt':	f.push('>');  break;
				case 'gte':	f.push('>='); break;
				case 'cts': f.push('@>'); break;
				case 'ctd': f.push('<@'); break;
				case 'mts': f.push('@@'); break;
			}
			f.push("$" + i);
			log.d("FFFF", f);
			filters.push(f.join(""));
			values.push(filter[2]);
			i++;
		});
		sql.push(filters.join(" AND "));
	}
	
	log.d("Sql:", sql);
	return {
		query: sql.join(" "),
		values: values
	};
}

/*function makeDeleteQuery(transform) {
	
}*/


function runQueries(client, queries, callback) {
	function rollback(err, client, done) {
		client.query('ROLLBACK', function(er) {
			log.e("Rollback", err, er);
			return done(err);
		});
	}
	client.query("BEGIN", function(err) {
		var results = [];
		for (var i = 0;i < queries.length;i++) {
			results.push(null);
		}
		log.d("Length:", results.length);
		if (err) rollback(err, client, callback);
		function run(i) {
			if (i < queries.length) {
				client.query(queries[i].query, queries[i].values, function(err, result) {
					console.log("arguments run queries:", arguments, queries[i].query);
					results[i] =  result;
					if (err) rollback(err, client, callback);
					else run(i + 1);
				});
			} else {
				client.query("COMMIT", function(err) {
					callback(err, results);
				});
			}
		}
		run(0);
	});
}


/*column name*/
function name(n) {
	return '"' + n + '"';
}
