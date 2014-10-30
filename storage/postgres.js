var pg = require('pg');

module.exports = function(conf) {

	function conn(source) {
		switch (source) {
			case 'texts':
			case 'threads':
				return conf.db.content;
			default:
				return conf.db.entity;
		}
	}
	
	function value (val, context) {
		if(typeof val === 'number') {
			return val;
		} else if (typeof val === 'string') {
			return "'" + val.replace("'", '') + "'";
		} else if (typeof val === 'object') {
			if(val instanceof Array) {
				if (context == 'json') {
					return "'" + JSON.stringify() + "'::jsonb";
				}
				return 'ARRAY[' + val.map(value).join(',') + ']';
			} else {
				return "'" + JSON.stringify(val) + "'::jsonb";
			}
		}
	}
	
	function name(str) {
		return '"' + str.replace('"', '') + '"';
	}
	
	function filtersql(filters) {
		var sql = [], i, f;
		for(i=0; i<filters.length; i++) {
			f = filters[i];
			sql.push(!i? 'WHERE': 'AND', name(f[0]));
			if(f[1].indexOf('prop') === 0) {
				sql.push('->', name(f[2]));
				f = [f[0], f[1].substr(4), f[3]];
			}
			switch(f[1]) {
				case 'eq': 	sql.push('=');  break;
				case 'neq':	sql.push('<>'); break;
				case 'lt':	sql.push('<');  break;
				case 'lte':	sql.push('<='); break;
				case 'gt':	sql.push('>');  break;
				case 'gte':	sql.push('>='); break;
				case 'cts': sql.push('@>'); break;
				case 'ctd': sql.push('<@'); break;
			}
			sql.push(value(f[f.length-1]));
		}
		return sql;
	}
	
	function insertsql(data) {
		var sql=[], names=[], values=[], i;
		for(i in data) {
			names.push(name(i));
			values.push(value(data[i]));
		}
		sql = ['('].concat(names, ') VALUES (', )
	}
	
	function updatesql(data) {
		
	}
	
	function rollback (client, done) {
		client.query('ROLLBACK', function(err) {
			return done(err);
		});
	}

	function get (q, cb) {
		var sql = ['SELECT * FROM'], i;
		
		sql.push(name(q.sources[0]));
		
		for(i=1; i<q.sources.length; i++) sql.push(
			'INNER JOIN', name(q.sources[i][0]), 'ON',
			name(q.sources[0]) + '."id" =',
			name(q.sources[i][0]) + '.' + name(q.sources[i][1])
		);
		
		sql = sql.concat(filtersql(q.filters));
		
		if(q.iterate.key && typeof q.iterate.start !== 'undefined') sql.push(
			q.filters.length? 'AND': 'WHERE', name(q.iterate.key),
			q.iterate.reverse? '<=': '>=', value(q.iterate.start)
		);
		if(q.iterate.key) sql.push(
			'ORDER BY', name(q.iterate.key), q.iterate.reverse? 'DESC': 'ASC'
		);

		if(q.iterate.limit) sql.push('LIMIT', value(q.iterate.limit));
		if(q.iterate.skip) sql.push('OFFSET', value(q.iterate.skip));
		
		pg.connect(conn(q.sources[0]), function (err, client, done) {
			if(err) return cb(err);
			client.query(sql.join(" "), function (err, results) {
				process.nextTick(function() { cb(err, results); });
				done();
			});
		});
	}
	
	function put (q, cb) {
		var delsql=['DELETE FROM'], inssql=['INSERT INTO'];
		
		if(!q.filters.length) return; // for safety
		delsql.push(name(q.source));
		delsql = delsql.concat(filtersql(q.filters));
		
		inssql.push(name(q.source));
		inssql.push(insertsql(q.data));
		
		pg.connect(conn(q.source), function(err, client, done) {
			if(err) return cb(err);
			client.query('BEGIN', function(err) {
				if(err) { rollback(done); return cb(err); }
				client.query(delsql.join(' '), function(err) {
					if(err) { rollback(done); return cb(err); }
					client.query(inssql.join(' '), function(err) {
						if(err) { rollback(done); return cb(err); }
						client.query('COMMIT', function(err) {
							process.nextTick(function() { cb(err); });
							done(err);
						});
					});
				});
			});
		});
	}
	
	function del (q, cb) {
		var sql = ['DELETE FROM'];
		
		if(!q.filters.length) return; // for safety
		sql.push(name(q.source));
		sql = sql.concat(filtersql(q.filters));
		
		pg.connect(conn(q.source), function(err, client, done) {
			if(err) return cb(err);
			client.query(sql.join(' '), function (err) {
				process.nextTick(function() { cb(err); });
				done();
			});
		});
	}
	
	return { get: get, put: put, del: del };
	
};