var log = require('./../lib/logger.js');
module.exports = {
	timetoString: function(time) {
		return (new Date(time));
	},
	transformsToQuery: function(transforms) {
		var r = [];
		transforms.forEach(function(transform) {
			var reply = toQuery(transform);
			if (reply instanceof Array) {
				reply.forEach(function(rep) {
					r.push(rep);
				});
			} else r.push(reply);
		});
		return r;
	},
	runQueries: runQueries
};

function toQuery(transform) {
	log.d("Transform type: ", transform);
	var ret;
	switch(transform.type) {
		case 'insert': ret = makeInsertQuery(transform); break;
		case 'update': ret = makeUpdateQuery(transform); break;
		case 'upsert': ret = makeUpsertQuery(transform); break;
		case 'select': ret = makeSelectQuery(transform); break;
		
	}
	return ret;
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
This query to filter should have a unique key constraints 
@return Array of queries.
// http://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql
*/
function makeUpsertQuery(transform) {
	log.d("Upsert query");
	var updateQuery = getUpdateQuery(transform, 1, true),
		i = 1, values = [];
	var inSql = [];
	inSql.push("INSERT INTO");
	inSql.push(transform.source);
	inSql.push("(");
	var keys = [], inValues = [];
	for (var key in transform.insert) {
		keys.push(name(key));
		inValues.push("$" + i);
		values.push(transform.insert[key]);
		i++;
	}
	inSql.push(keys.join(','));
	
	inSql.push(")");
	inSql.push("SELECT");
	inSql.push(inValues.join(","));
	/** make last query*/
	var sql = [];
	addFilters(transform, sql, values, i); // sql ['where', 'id=$1' AND user=$2]
	inSql.push("WHERE NOT EXISTS (SELECT 1 FROM " + transform.source + " " + sql.join(" ") + ")");
	
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

	addFilters(transform, sql, values, i);

	log.d("Sql:", sql);
	return {
		query: sql.join(" "),
		values: values
	};
}
/**
1. select * from texts where time > 123456373 and "from"='roomname' and time > text.room.createTime && order by time desc limit 256 
only non [hidden].
2. select * from entities INNER JOIN relations on (relations.user=entities.id AND relations.role='follower' AND relations.user='russeved');

if delete time is set.
2. 
*/
function makeSelectQuery(transform) {
	log.d("Transform", transform);
	if (transform.iterate.keys && transform.iterate.keys.length) {
		if (typeof transform.iterate.keys === 'string') transform.iterate.keys = [transform.iterate.keys]; // if string change it to an array
		for (var j = 0; j < transform.iterate.keys.length; j++) {
			if (transform.iterate.reverse) {
				transform.filters.push([transform.iterate.keys[j], 'lte', transform.iterate.start[j]]);
			} else {
				transform.filters.push([transform.iterate.keys[j], 'gte', transform.iterate.start[j]]);
			}
		}
	}
	log.d("Transform", transform);
	var sql = [], i = 1, values = [], t;
	sql.push("SELECT");
	t = [];
	if (transform.select) {
		transform.select.forEach(function(s) {
			t.push(name(s));
		});
		sql.push(t.join(','));
	} else {
		sql.push("*");
	}
	sql.push("FROM");
	/* adding source can have multiple source */
	if (transform.sources && transform.sources.length) { // JOIN query
		sql.push(transform.sources[0]);
		sql.push("INNER JOIN");
		sql.push(transform.sources[1]);
		sql.push("ON");
		t = [];
		transform.filters.forEach(function(filter) {
			var p1, p2;
			
			if (filter[0] instanceof Array) p1 = filter[0][0] + "." + filter[0][1]; 
			else p1 = name(filter[0]);
			
			if (filter[2] instanceof Array) p2 = filter[2][0] + "." + filter[2][1]; 
			else {
				p2 = "$" + i;
				values.push(filter[2]);
				i++;
			}
			
			t.push(p1 + getOperatorString(filter[1]) + p2);
		});
		var s = "(" + t.join(" AND ") + ")";
		sql.push(s);
	} else {
		
		sql.push(transform.source);
		/* added source */
		addFilters(transform, sql, values, i);
	}
	
	if (transform.iterate.keys && transform.iterate.keys.length) {
		var orderby = [];
		transform.iterate.keys.forEach(function(key) {
			orderby.push(name(key) + " " + (transform.iterate.reverse ? "DESC": "ASC"));
		});
		sql.push("order by " + orderby.join(','));
	}
	sql.push("LIMIT " + transform.iterate.limit);
	return {
		query: sql.join(" "),
		values: values
	};
	
}

function addFilters(transform, sql, values, i) {
	log.d("Transform", transform);
	var filters = [];
	if (transform.filters && transform.filters.length) {
		sql.push("WHERE");
		transform.filters.forEach(function(filter) {
			var f = [name(filter[0])];
			if (filter[1] != 'in') {
				f.push(getOperatorString(filter[1]));
				f.push("$" + i);
				filters.push(f.join(""));
				values.push(filter[2]);
				i++;
			} else { // IN operator. ( IN ('abc', 'cde'))
				f.push(getOperatorString(filter[1]));
				f.push("(");
				var tf = [];
				filter[2].forEach(function(e) {
					tf.push("$" + (i++));
					values.push(e);
				});
				f.push(tf.join(','));
				f.push(")");
				filters.push(f.join(""));
			}
		});
		sql.push(filters.join(" AND "));
	}
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
	if (n instanceof Array) {
		return n[0] + "." + n[1];
	} else {
		return '"' + n + '"';
	}
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
		case 'in': r = " IN ";break;
		default: throw new Error("Invalid operator string: " + s);
	}
	return r;
}