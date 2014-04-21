module.exports = function(types) {
	return {
		put : function(data, cb) {
			var thread = {
				id: data.id,
				to: data.to,
				title: data.title,
				startTime: data.startTime,
				endTime: data.endTime
			};
			types.threads.put(thread);
		},
		get: function(query, callback) {
			var dbQuery = {};
			if(query.ref) {
				return types.threads.get(query.ref, function(err, thread) {
					console.log(err, thread);
					if(err || !thread) return callback();
					query.results = [thread];
					return callback();
				});
			}
			
			dbQuery.by = "tostartend";
			dbQuery.start = [];
			dbQuery.end = [];
			dbQuery.start.push(query.to);
			dbQuery.end.push(query.to);
			dbQuery.limit = 256;

			if(typeof query.time !== "undefined") {
				if(query.after) {
					dbQuery.start.push(query.time);
					dbQuery.end.push(9E99);
					if(query.after <= dbQuery.limit) dbQuery.limit = query.after;
				}else if(query.before) {
					dbQuery.start.push(0);
					dbQuery.end.push(query.time);
					if(query.before <= dbQuery.limit) dbQuery.limit = query.before;
				}
			}

			dbQuery.reverse = false;
			console.log(dbQuery);
			types.threads.get(dbQuery, function(err, results) {
				if(err || !results) { return callback(); }
				query.results = results;
				return callback();
			});
		}
	}
};
