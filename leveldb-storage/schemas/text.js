/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {

	var texts = types.texts;
	
	return {
		put: function (message, cb) {
			var newLabels = {}, room = message.room, user = message.user;
			if(message.labels) {
				newLabels = message.labels;
			} else {
				newLabels = {};
			}

			texts.put({
				id:message.id,
				type:"text",
				from:message.from,
				to:message.to,
				text:message.text,
				time:message.time,
				threads: message.threads || [],
				labels: newLabels,
				editInverse:message.editInverse || [],
				mentions: message.mentions || [],
				cookies: message.cookies || [],
				session: message.session || ""
			}, function(err, res) {
				function insertThread(threads, i, callback) {
					var thread, e;
					if(i>=threads.length) return callback();
					e = threads[i]
					if(e.title) {
						thread = {
							id: e.id,
							title: e.title,
							to: message.to,
							startTime: message.time,
							endTime: message.time
						};
						types.threads.put(thread, {preUpdate: function(old, obj) {
							if(old.startTime) {
								obj.startTime = old.startTime;
							}else {
								obj.startTime = message.time;
							}
							obj.endTime = message.time;
						}}, function(){
							insertThread(threads, i+1, callback);
						});
					}else{
						insertThread(threads, i+1, callback);
					}
				}
				if(message.threads) {
					insertThread(message.threads, 0, function() {
						cb && cb(err, res);	
					});		
				}
			});
		},
		
		get: function (query, cb) {
			var qStart = new Date().getTime(), qEnd;
			var reversed, start, end, startTime = new Date().getTime();
			var dbQuery = {};
			if(query.ref) {
				return texts.get(query.ref, function(err, data){
					if(!data) return cb();
					query.results = [data];
					return cb();
				});
			}
			dbQuery.gte = [];
			dbQuery.lte = [];
			dbQuery.limit = 256;

			dbQuery.gte.push(query.to);
			dbQuery.lte.push(query.to);

			if(query.thread) {
				dbQuery.by = "tothreadtime";
				dbQuery.gte.push(query.thread);
				dbQuery.lte.push(query.thread);
			} else {
				dbQuery.by = "totime";
			}

			if(query.time!=0 && query.time) {
				if(query.after) {
					dbQuery.gte.push(query.time);
					if(query.after <= dbQuery.limit) dbQuery.limit = query.after;
				}else if(query.before) {
					dbQuery.lte.push(query.time);
					dbQuery.reverse = true;
					if(query.before <= dbQuery.limit) dbQuery.limit = query.before;
				}
			}else{
				if(query.after) {
					query.results = [];
					return cb();
				} else if(query.before) {
					dbQuery.lte.push(0xffffffffffffffff);
					if(query.before <= dbQuery.limit) dbQuery.limit = query.before;
				}
			}
			if(query.before) {
				dbQuery.reverse = true;	
			}
			texts.get(dbQuery, function(err, data) {
				if(err) return cb(err);
				if(dbQuery.reverse) data = data.reverse();
				log("Query completed in ", new Date().getTime()-qStart, dbQuery);
				query.results = data;
				cb();
			});
		}
	};
};
