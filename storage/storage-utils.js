var log = require('./../lib/logger.js');
module.exports = {
	timetoString: function(time) {
		return (new Date(time).toISOString());
	},
	transformsToQuery: function(transforms) {
		var r = [];
		transforms.forEach(function(transform) {
			var reply = toQuery(transform);
			if (reply instanceof Array) {
				reply.forEach(function(rep) {
					r.push(rep);
				});
			} else r.push(toQuery(transform));
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
	} else if (transform.type === 'upsert') {
		return makeUpsertQuery(transform);
	}
}

function makeInsertQuery(transform, index) {
	if (!index) index = 1;
	var sql = [], names=[], values=[], v = [], i;
	sql.push("INSERT INTO");
	sql.push(transform.source);
	for(i in transform.insert) {
		values.push("$" + (index));
		names.push(columnName(i));
		v.push(transform.insert[i]);
		index++;
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
	return getUpdateQuery(transform, 1, true);
}


/**
UPDATE table SET field='C', field2='Z' WHERE id=3;
INSERT INTO table (id, field, field2)
       SELECT 3, 'C', 'Z'
       WHERE NOT EXISTS (SELECT 1 FROM table WHERE id=3); 
@return Array of queries.
// http://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql
*/
function makeUpsertQuery(transform) {
	log.d("Upsert query");
	var updateQuery = getUpdateQuery(transform, 1, true),
		i = 1, values = [];
	/*var insertQuery = makeInsertQuery(transform, i);
	sql.push(insertQuery.query );
	values.push(insertQuery.values);*/
	var inSql = [];
	inSql.push("INSERT INTO");
	inSql.push(transform.source);
	inSql.push("(");
	var keys = [], inValues = [];
	for (var key in transform.insert) {
		keys.push(key);
		inValues.push("$" + i);
		values.push(transform.insert[key]);
		i++;
	}
	inSql.push(keys.join(','));
	
	inSql.push(")");
	inSql.push("SELECT");
	inSql.push(inValues.join(","));
	/** make last query*/
	var filters = [];
	var fs = [];
	if (transform.filters && transform.filters.length) {
		fs.push("WHERE");
		transform.filters.forEach(function(filter) {
			var f = [name(filter[0])];
			f.push(getOperatorString(filter[1]));
			f.push("$" + i);
			log.d("FFFF", f);
			filters.push(f.join(""));
			values.push(filter[2]);
			i++;
		});
		fs.push(filters.join(" AND "));
	}
	inSql.push("WHERE NOT EXISTS (SELECT 1 FROM " + transform.source + " " + fs.join(" ") + ")");
	
	return [
		updateQuery, {
		query: inSql.join(" "),
		values: values
	}];
}

/*function makeDeleteQuery(transform) {
	
}*/
/**
used by update and upsert.
*/
function getUpdateQuery(transform, i, isSource) {
	var sql = [], values = [];
	sql.push("UPDATE");
	if (isSource) sql.push(transform.source);
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
			f.push(getOperatorString(filter[1]));
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


function getOperatorString(s) {
	var r;
	switch(s) {
		case 'eq': 	r = '=';  break;
		case 'neq':	r = '<>'; break;
		case 'lt':	r = '<';  break;
		case 'lte':	r = '<='; break;
		case 'gt':	r = '>';  break;
		case 'gte':	r = '>='; break;
		case 'cts': r = '@>'; break;
		case 'ctd': r = '<@'; break;
		case 'mts': r = '@@'; break;
		default: throw new Error("Invalid string");
	}
	return r;
}