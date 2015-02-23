/* global libsb, currentState */
/* jshint browser:true */

module.exports = function(ArrayCacheOp) {
	libsb.on('getTexts', function(query, next) {
		// getTextsBefore
		var key;
		// ArrayCache cannot handle ref queries without time property, sending to server.
		if (query.hasOwnProperty('ref') && !query.hasOwnProperty('time')) {
			return next();
		}
		if (query.hasOwnProperty('updateTime')) {
			return next();
		}
		if (query.thread) {
			// creating individual cache entries for queries with the thread property
			key = ArrayCacheOp.generateLSKey(query.to, query.thread, 'texts');
		} else {
			key = ArrayCacheOp.generateLSKey(query.to, 'texts');
		}
		if (!ArrayCacheOp.cache.hasOwnProperty(key)) {
			ArrayCacheOp.loadArrayCache(key);
		}

		if (!ArrayCacheOp.cache[key].d.length) {
			return next();
		}

		if (query.time === null && currentState.connectionStatus === "online") {
			// query.time is null, have to decide how LS will handle this.
			return next();
		}
		if (currentState.connectionStatus !== "online") query.partials = true;
		if (query.thread) return next();

		var results = ArrayCacheOp.cache[key].get('time', query);
		if (!results || !results.length) {

			return next();
		} else {
			query.results = results;
			query.resultSource = 'localStorage';

			return next();
		}
	}, 200); // runs before the socket

	libsb.on('getTexts', function(query, next) {
		var results = query.results;
		if (!query.results || !query.results.length || query.resultSource == 'localStorage') {
			return next();
		}

		results = query.results.slice(0); // copying by value
		if (results && results.length > 0) {
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
			var lskey = ArrayCacheOp.generateLSKey(query.to, 'texts');
			if (!ArrayCacheOp.cache.hasOwnProperty(lskey)) {
				ArrayCacheOp.loadArrayCache(lskey);
			}
			ArrayCacheOp.cache[lskey].put('time', results);

			if (query.thread) {
				// save into thread cache as well 
				var lsThreadKey = ArrayCacheOp.generateLSKey(query.to, query.thread, 'texts');
				if (!ArrayCacheOp.cache.hasOwnProperty(lsThreadKey)) {
					ArrayCacheOp.loadArrayCache(lsThreadKey);
				}
				ArrayCacheOp.cache[lsThreadKey].put('time', results);
				ArrayCacheOp.saveArrayCache(lsThreadKey);
			}

			ArrayCacheOp.saveArrayCache(lskey);
		}
		next();
	}, 8); // runs after the socket

	libsb.on('text-dn', function(text, next) {
		var key = ArrayCacheOp.generateLSKey(text.to, 'texts');
		ArrayCacheOp.loadArrayCache(key);
		var lastItem = ArrayCacheOp.cache[key].d[ArrayCacheOp.cache[key].length - 1];

		if (lastItem && lastItem.type === 'result-end') {
			ArrayCacheOp.start('time', key, window.backTimes[text.to]);
		}

		ArrayCacheOp.cache[key].d.push(text);
		ArrayCacheOp.saveArrayCache(key);
		// putting the incoming text into each threadId cache it is a part of

		if (text.threads) {
			text.threads.forEach(function(threadObj) {
				key = ArrayCacheOp.generateLSKey(text.to, threadObj.id, 'texts');

				ArrayCacheOp.loadArrayCache(key);
				lastItem = ArrayCacheOp.cache[key].d[ArrayCacheOp.cache[key].length - 1];

				if (!lastItem || lastItem.type === 'result-end') {
					ArrayCacheOp.start('time', key, window.backTimes[text.to]);
				}
				ArrayCacheOp.cache[key].d.push(text);
				ArrayCacheOp.saveArrayCache(key);
			});
		}

		// check if new thread was created.
		if (text.labels && text.labels.hasOwnProperty('startOfThread') && text.labels.startOfThread === 1) {
			var threadKey = ArrayCacheOp.generateLSKey(text.to, 'threads');
			ArrayCacheOp.loadArrayCache(threadKey);
			var lastThread = ArrayCacheOp.cache[threadKey].d[ArrayCacheOp.cache[threadKey].d.length - 1];
			if (!lastThread || lastThread.type === 'result-end') {
				ArrayCacheOp.start('startTime', threadKey, window.backTimes[text.to]);
			}
			var newThread = text.threads[0];
			newThread.startTime = text.time;
			ArrayCacheOp.cache[threadKey].d.push(newThread);
			ArrayCacheOp.saveArrayCache(threadKey);
		}

		next();
	}, 500); // storing new texts to cache.
};