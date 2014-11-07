/* global libsb, currentState */
/* jshint browser:true */

module.exports = function (ArrayCacheOp) {
	libsb.on('getThreads', function (query, next) {
		if (query.hasOwnProperty('noCache') && localStorage.noCache === true) {
			return next();
		}
		if (query.hasOwnProperty('q')) { // search queries should always be served from the server.
			return next();
		}
		var key = ArrayCacheOp.generateLSKey(query.to, 'threads');
		if (!ArrayCacheOp.cache.hasOwnProperty(key)) {
			ArrayCacheOp.loadArrayCache(key);
		}
		if (!ArrayCacheOp.cache[key].d.length) {
			return next();
		}

		if (query.time === null && currentState.connectionStatus!== "online") {
			// query.time is null, have to decide how LS will handle this.
			return next();
		}
		if (currentState.connectionStatus !== "online") query.partials = true;

		var results = ArrayCacheOp.cache[key].get('startTime', query);

		if (!results || !results.length) {
			return next();
		} else {
			query.results = results;
			query.resultSource = 'localStorage';
			return next();
		}
	}, 200); // runs before the socket

	libsb.on('getThreads', function (query, next) {
		if (!query.results || query.resultSource === 'localStorage') {
			return next();
		}
		var results = query.results.slice(0); // copy by value
		if (results && results.length > 0) {
			// merge results to cache
			if (query.before) {
				if (results.length === query.before) {
					results.unshift({
						type: 'result-start',
						startTime: results[0].startTime,
						endtype: 'limit'
					});
				}
				results.push({
					type: 'result-end',
					endtype: 'time',
					startTime: query.time
				});
			} else if (query.after) {
				if (results.length === query.after) {
					results.push({
						type: 'result-end',
						startTime: results[results.length - 1].startTime,
						endtype: 'limit'
					});
				}
				results.unshift({
					type: 'result-start',
					endtype: 'time',
					startTime: query.time
				});
			}
			var lskey = ArrayCacheOp.generateLSKey(query.to, 'threads');
			if (!ArrayCacheOp.cache.hasOwnProperty(lskey)) {
				ArrayCacheOp.loadArrayCache(lskey);
			}
			ArrayCacheOp.cache[lskey].put('startTime', results);
			ArrayCacheOp.saveArrayCache(lskey);
		}
		next();
	}, 8); // runs after socket 	
};