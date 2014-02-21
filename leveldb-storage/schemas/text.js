/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {

	var texts = types.texts;
	
	return {
		put: function (message, cb) {
			var newLabel = {}, room = message.room, user = message.user;
			log("Pushing to leveldb", message);
			if(message.labels instanceof Array) {
				message.labels.forEach(function(element) {
					newLabel[element] = 1;
					// texts.link(message.id, 'hasLabel', element, {score: 1});
				});
			}else{
				newLabel = message.labels;
			}
			message.labels = newLabel;
			texts.put({
				id:message.id,
				type:"text",
				from:message.from,
				to:message.to,
				text:message.text,
				time:message.time,
				labels:message.labels,
				editInverse:message.editInverse,
				mentions:message.mentions,
				session: message.session || ""
			}, function(err, res) {
				for(i in message.labels){
					types.labels.put({id:i});
					if(message.labels.hasOwnProperty(i)) {
						texts.link(message.id, 'hasLabel', i, {score: message.labels[i]});
					}
				}
				log(err, res);
				cb && cb(err, res);
			});
			
		},
		
		get: function (options, cb) {
			var query = {}, reversed, start, end, startTime = new Date().getTime();
			if(options.id) {
				return texts.get(options.id, function(err, data){
					if(!data) return cb();
					return cb(true,[data]);
				});
			}else {
				return cb();
			}
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
