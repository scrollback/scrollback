var log = require('./../lib/logger.js'),
	BigInteger = require('big-integer');

/*column name*/
function name(n) {
	"use strict";
	if (n instanceof Array) {
		return n[0] + "." + n[1];
	} else {
		return '"' + n + '"';
	}
}
function getOperatorString(s) {
	"use strict";
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

function getAdvisoryLockQuery(transform) {
	"use strict";
	var s = transform.lock;
	if (!s) throw new Error("transform.lock is undefined for upsert query");
	s = new Buffer(s).toString('hex');
	var hash = new BigInteger(s.substring(0, 15), 16); // 60 bit
	var index = 15;
	while(index < s.length) {
		var nbi = new BigInteger(s.substring(index, index + 15), 16);
		index += 15;
		hash = hash.xor(nbi);
	}
	// hash is 60 bit hash value of id.
	var r = {
		query: "SELECT pg_advisory_xact_lock(" + hash.toString() + ")",
		values: []
	};
	return r;
}

function toQuery(transform) {
	"use strict";
	log("Transform:", transform);
	var ret;
	switch(transform.type) {
		case 'insert': ret = makeInsertQuery(transform); break;
		case 'update': ret = makeUpdateQuery(transform); break;
		case 'upsert': ret = makeUpsertQuery(transform); break;
		case 'select': ret = makeSelectQuery(transform); break;

	}
	log.d("Queries: ", ret);
	return ret;
}

function makeInsertQuery(transform, index) {
	"use strict";
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
	"use strict";
	return '"' + str.replace('"', '') + '"';
}



function addFilters(transform, sql, values, i) {
	"use strict";
	var filters = [];
	if (transform.filters && transform.filters.length) {
		sql.push("WHERE");
		transform.filters.forEach(function(filter) {
			if(typeof filter.length === 'undefined') {
				filters.push(filter.sql.replace(/\$/g, function() {
						values.push(filter.values.shift());
						return "$" + (i++);
				}));
			} else {
				log.d("Legacy filter used: ", filter);
				// old style [ column, op, value] filter
				var f = [name(filter[0])];
				if (filter[1] !== 'in') {
					f.push(getOperatorString(filter[1]));
					f.push("$" + i);
					filters.push(f.join(""));
					values.push(filter[2]);
					i++;
				} else { // IN operator. ( IN ('abc', 'cde'))
					f.push(getOperatorString(filter[1]));
					var inString = arrayToStringForInOperator(filter[2], i, values);
					f.push(inString);
					i += filter[2].length;
					filters.push(f.join(""));
				}
			}
		});
		sql.push(filters.join(" AND "));
	}
}
/**
used by update and upsert.
*/
function getUpdateQuery(transform, i, isSource) {
	"use strict";
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

	addFilters(transform, sql, values, i);

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
	"use strict";
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
	var sql = [], i = 1, values = [], t;
	sql.push("SELECT");
	t = [];
	if (transform.select) {
		transform.select.forEach(function(r) {
			t.push(name(r));
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
			if(filter.sql) {
				t.push(filter.sql.replace(/\$/g, function() {
						values.push(filter.values.shift());
						return "$" + (i++);
				}));
				return;
			}
				
			
			if (filter[0] instanceof Array) p1 = filter[0][0] + "." + filter[0][1];
			else p1 = name(filter[0]);

			if (filter.length === 4 && filter[3] === 'column') {
				p2 = filter[2][0] + "." + filter[2][1];
			} else if (filter[1] === 'in') {
				var inString = arrayToStringForInOperator(filter[2], i, values);
				p2 = inString;
				i += filter[2].length;
			} else {
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
	if(transform.iterate.limit) sql.push("LIMIT " + transform.iterate.limit);

	return {
		query: sql.join(" "),
		values: values
	};

}


/**
@params array: input array.
@params i: current index in query
@values array
@return string ($i, $i + 1, $i + 2  ... , $i + array length);
*/
function arrayToStringForInOperator(array, i, values) {
	"use strict";
	var f = [];
	f.push("(");
	var tf = [];
	array.forEach(function(e) {
		tf.push("$" + (i++));
		values.push(e);
	});
	f.push(tf.join(','));
	f.push(")");
	return f.join("");
}




function makeUpdateQuery(transform) {
	"use strict";
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
Upsert query is using Advisory lock on id.
*/
function makeUpsertQuery(transform) {
	"use strict";
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
		getAdvisoryLockQuery(transform),
		updateQuery, {
		query: inSql.join(" "),
		values: values
	}];
}

/*function makeDeleteQuery(transform) {

}*/

module.exports = {
	transformsToQuery: function(transforms) {
		"use strict"; 
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
	runQueries: require('./run-queries.js')
};
