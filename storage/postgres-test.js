/* global it */

var pg = require('./postgres.js')({db: {}}),
	assert = require('assert');


it('should do simple selects', function(done) {
	var sql = pg.get({
		sources: ['table1'],
		filters: [
			['col1', 'eq', 123],
			['col2', 'neq', 'asdf'],
			['col3', 'propgt', 'asdf', 43],
			['col4', 'cts', [['irc']] ],
			['col5', 'cts', {abc: [30]}]
		],
		iterate: { key: 'keycol', start: 0, reverse: false, limit: 10, skip: 5 }
	});
	
	assert.equal(sql, '');
	done();
});