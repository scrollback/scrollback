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
				threads: message.threads || {},
				labels: newLabels,
				editInverse:message.editInverse || {},
				mentions: message.mentions || [],
				cookies: message.cookies || [],
				session: message.session || ""
			}, function(err, res) {
				/*var x = 1000;
				p = message.time;
				q = message.time;*/
				function insertThread(threads, i, callback) {
					var thread, e = threads[i];
					if(i>=threads.length) return callback();
					if(e.title) {
						thread = {
							id: e.id,
							title: e.title,
							to: message.to,
							startTime: message.time,
							endTime: message.time
						};
					/*	thread = {
							id: e.id,
							title: e.title,
							to: message.to,
							startTime: (p = x+ message.time),
							endTime: (q = (2*x) + message.time)
						};
						x = x+1000;*/
						
						
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

				insertThread(message.threads, 0, function() {
					cb && cb(err, res);	
				});
				
			});
		},
		
		get: function (options, cb) {
			var query = {}, reversed, start, end, startTime = new Date().getTime();
			var dbQuery = {};
			
			if(options.id) {
				return texts.get(options.id, function(err, data){
					if(!data) return cb();
					return cb(true,[data]);
				});
			}
			dbquery.start = [];
			dbquery.end = [];
			dbQuery.limit = 256;

			if(typeof query.time == "undefined") {
				query.time  = new Date().getTime();
				query.before = 256;
			}
			
			dbquery.start.push(query.to);
			dbquery.end.push(query.to);

			if(options.thread) {
				dbquery.by = "tothreadtime";
				dbquery.start.push(query.thread);
				dbquery.end.push(query.thread);
			} else {
				dbQuery.by = "totime";
			}


			if(options.before) {
				dbquery.start.push(0);
				dbquery.end.push(query.time);
				if(query.after <= dbQuery.limit) dbQuery.limit = query.after;
			} else if(options.after) {
				dbquery.start.push(query.time);
				dbquery.end.push(9E99);
				if(query.before <= dbQuery.limit) dbQuery.limit = query.before;
			}

			texts.get(query, function(err, data) {
				if(err) return cb(err);
				query.results = data;
				cb();
			});
		}
	};
};
