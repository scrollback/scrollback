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
					if(err || !thread) return callback();
					query.results = [thread];
					return callback();
				});
			}
			
			dbQuery.by = "tostartend";
			dbQuery.gte = [];
			dbQuery.lte = [];
			dbQuery.gte.push(query.to);
			dbQuery.lte.push(query.to);
			dbQuery.limit = 256;

			if(typeof query.time !== "undefined") {
				if(query.after) {
					dbQuery.gte.push(query.time);
					if(query.after <= dbQuery.limit) dbQuery.limit = query.after;
				}else if(query.before) {
					dbQuery.lte.push(query.time);
					if(query.before <= dbQuery.limit) dbQuery.limit = query.before;
				}
			}else{
				if(query.after) {
					query.results = [];
					return callback();
				} else if(query.before){
					dbQuery.lte.push(0xffffffffffffffff);
					if(query.before <= dbQuery.limit) dbQuery.limit = query.before;
				}
			}
			if(query.before) {
				dbQuery.reverse = true;	
			}
			
			types.threads.get(dbQuery, function(err, results) {
				if(err || !results) { return callback(); }
				
				if(query.before) {
					dbQuery.reverse = true;	
					results = results.reverse();
				}
				query.results = results;
				return callback();
			});
		}
	}
};
