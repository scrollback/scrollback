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
	}
};


function toQuery(transform) {
	log.d("Transform type: ", transform);
	if (transform.type === 'insert') {
		return makeInsertQuery(transform);
	} else if (transform.type === 'update') {
		
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
	
}

function makeDeleteQuery(transform) {
	
}

