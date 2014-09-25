/* global libsb, currentState */
/* jshint browser:true */

module.exports = function (cacheOp) {
	libsb.on('getTexts', function (query, next) {
		// getTextsBefore
		var key;
		if (query.thread) {
			// creating individual cache entries for queries with the thread property
			key = cacheOp.generateLSKey(query.to, query.thread, 'texts');
		} else {
			key = cacheOp.generateLSKey(query.to, 'texts');
		}
		if (!cacheOp.cache.hasOwnProperty(key)) {
			cacheOp.loadArrayCache(key);
		}

		if (!cacheOp.cache[key].d.length) {
			return next();
		}

		if (query.time === null && currentState.connectionStatus) {
			// query.time is null, have to decide how LS will handle this.
			return next();
		}
		if (!currentState.connectionStatus) query.partials = true;
		if (query.thread) return next();

		var results = cacheOp.cache[key].get('time', query);
		if (!results || !results.length) {

			return next();
		} else {
			query.results = results;
			query.resultSource = 'localStorage';

			return next();
		}
	}, 200); // runs before the socket

	libsb.on('getTexts', function (query, next) {
		var results = query.results;
		if (!query.results || !query.results.length || query.resultSource == 'localStorage') {
			return next();
		}

		results = query.results.slice(0); // copying by value
		if (results && results.length > 0) {
			if(query.hasOwnProperty("updateTime"))
			// merging results into the Cache.
			if (query.before) {
				if (results.length === query.before) {
					results.unshift({
						type: 'result-start',
						time: results[0].time,
						endtype: 'limit'
					});
				}
				results.push({
					type: 'result-end',
					endtype: 'time',
					time: query.time
				});
			} else if (query.after) {
				if (results.length === query.after) {
					results.push({
						type: 'result-end',
						time: results[results.length - 1].time,
						endtype: 'limit'
					});
				}
				results.unshift({
					type: 'result-start',
					endtype: 'time',
					time: query.time
				});
			}
			var lskey = cacheOp.generateLSKey(query.to, 'texts');
			if (!cacheOp.cache.hasOwnProperty(lskey)) {
				cacheOp.loadArrayCache(lskey);
			}
			cacheOp.cache[lskey].put('time', results);

			if (query.thread) {
				// save into thread cache as well 
				var lsThreadKey = cacheOp.generateLSKey(query.to, query.thread, 'texts');
				if (!cacheOp.cache.hasOwnProperty(lsThreadKey)) {
					cacheOp.loadArrayCache(lsThreadKey);
				}
				cacheOp.cache[lsThreadKey].put('time', results);
				cacheOp.saveCache(lsThreadKey);
			}

			cacheOp.saveCache(lskey);
		}
		next();
	}, 8); // runs after the socket

	libsb.on('text-dn', function (text, next) {
		var key = cacheOp.generateLSKey(text.to, 'texts');
		cacheOp.loadArrayCache(key);
		var lastItem = cacheOp.cache[key].d[cacheOp.cache[key].length - 1];

		if (lastItem && lastItem.type === 'result-end') {
			cacheOp.start('time', key, window.backTimes[text.to]);
		}

		cacheOp.cache[key].d.push(text);
		cacheOp.saveCache(key);
		// putting the incoming text into each threadId cache it is a part of

		if (text.threads) {
			text.threads.forEach(function (threadObj) {
				key = cacheOp.generateLSKey(text.to, threadObj.id, 'texts');

				cacheOp.loadArrayCache(key);
				lastItem = cacheOp.cache[key].d[cacheOp.cache[key].length - 1];

				if (!lastItem || lastItem.type === 'result-end') {
					cacheOp.start('time', key, window.backTimes[text.to]);
				}
				cacheOp.cache[key].d.push(text);
				cacheOp.saveCache(key);
			});
		}

		next();
	}, 500); // storing new texts to cache.
};