/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (store) {

	var texts = store('texts', {
		indexes: {
			totime: function (text, emit) {
				/*	time is stored in negative order because most searches
					will be in descending time. LevelDB reversed queries are
					slow.
				*/
				emit(text.to, -text.time);
			},
			tolabeltime: function(text, emit) {
				for(var i in text.labels) {
					emit(text.to, i, -text.time);
				}
			},
			mentiontotime: function(text, emit) {
				text.mentions.forEach(function(m) { emit(m, text.to, -text.time); });
			}
		}
	});
	
	return {
		put: function (message, cb) {
			log("Pushing to leveldb", message);
			texts.put(message, cb);
		},
		
		get: function (options, cb) {
			var query = {}, reversed, start, end, startTime = new Date().getTime();
			
			if(options.since && !options.until) {
				reversed = false;
				start = options.since; end = 9E99;
			} else {
				reversed = true;
				start = options.until || 9E99;
				end = options.since || 0;
			}
			
			options.limit = (typeof options.limit == 'number' && options.limit < 256)? options.limit: 256;
			
			if(options.to && options.label) {
				options.
				query.by = 'tolabeltime';
				query.start = [options.to, options.label, -start];
				query.end = [options.to, options.label, -end];
				query.reversed = !reversed; // timestamps are negative in the db.
				
				query.limit = options.limit + 1;
				
			} else if(options.to) {
				query.by = 'totime';
				query.start = [options.to, -start];
				query.end = [options.to, -end];
				query.reversed = !reversed; // timestamps are negative in the db.
				
				query.limit = options.limit + 1;
			}
			
			texts.get(query, function(err, data) {
				if(err) return cb(err);
				if(reversed) data = data.reverse();
				
				var start  = options.since || data.length && data[0].time || 0;
				var end = options.until || data.length && data[data.length-1].time || new Date().getTime();
		
				if (reversed) {
					data.push({type: 'result-end', to: options.to, time: end });
				} else {
					data.unshift({type: 'result-start', to: options.to, time: start });
				}
				
				if (options.limit && data.length > options.limit) {
					if (reversed) {
						data = data.slice(1);
						data.unshift({type: 'result-start', to: options.to, time: start });
					} else {
						data = data.slice(0, options.limit);
						data.push({type: 'result-end', to: options.to, time: end });
					}
				}
				
				log(data.length, "results in", new Date().getTime() - startTime, "ms");
				if(cb) cb(true, data);
			});
		}
	};
};