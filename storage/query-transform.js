function makeQuery() {
	function quantFilter(col, fob) {
		var filters = this.filters;
		
		if(typeof fob !== 'object') {
			filters.push([col, 'eq', fob]);
			return;
		}

		['eq', 'neq', 'lt', 'lte', 'gt', 'gte'].forEach(function(op) {
			if(fob.hasOwnProperty(op)) {
				filters.push([col, op, fob[op]]);
				return;
			}
		});
	}
	
	return { sources: [], filters: [], iterate: {
		key: null, start: null, reverse: false, skip: 0, limit: 256
	}, quantFilter: quantFilter };
}

// Content queries: texts, threads.

exports.getTexts = exports.getThreads = function(iq) {
	var q = makeQuery();
	q.sources.push(iq.type == 'getThreads'? 'threads': 'texts');
	
	if(iq.to) {
		q.filters.push(["to", "eq", iq.to]);
	}
	
	if(iq.thread && iq.type == 'getTexts') {
		q.filters.push(["thread", "eq", iq.thread]);
	}
	
	if(iq.label) {
		q.filters.push(["label", "propgt", iq.label, 0.5]);
	}
	
	if (iq.updateTime) {
		q.iterate.key = "updateTime";
		q.iterate.start = iq.updateTime;
	} else if (iq.type == 'getThreads' && iq.q) {
//		TODO: TEXT SEARCH
//		q.filters.push(["terms", "ts", iq.q]);
//		q.iterate.key = ["tsrank" "terms", iq.q];
//		
//		Maybe it won't go here at all.
	} else {
		q.iterate.key = "time";
		q.iterate.start = iq.time || new Date().getTime();
	}
	
	if(iq.before) {
		q.iterate.reverse = true;
		q.iterate.limit = iq.before;
	} else {
		q.iterate.limit = iq.after || 256;
	}
	
	return q;
};

// Entity queries: rooms, users.

exports.getEntities = exports.getRooms = exports.getUsers = function (iq) {
	var q = makeQuery();
	q.sources.push(iq.type == 'getEntities'? 'entities': iq.type == 'getRooms'? 'rooms': 'users');
	
	if (iq.ref) {
		q.filters.push(["id", "eq", iq.ref]);
	}
    
    if (iq.identity) {
		q.filters.push('identities', 'cts', [iq.identity]);
	}
	
	if (iq.memberOf) {
		q.sources.push(['memberships', 'user']);
		q.filters.push(['room', 'eq', iq.memberOf]);
	}
	
	if (iq.hasMember) {
		q.sources.push(['memberships', 'room']);
		q.filters.push(['user', 'eq', iq.hasMember]);
	}
	
	if (iq.timezone) q.quantFilter('timezone', iq.timezone);
	if (iq.locale) q.quantFilter('locale', iq.locale);
	if (iq.role) q.quantFilter('role', iq.role);
	
	if(iq.roleTime) {
		q.iterate.key = 'roleTime';
		q.iterate.start = iq.roleTime;
	} else if(iq.createTime) {
		q.iterate.key = 'roleTime';
		q.iterate.start = iq.roleTime;
	}
	
	if(iq.before) {
		q.iterate.reverse = true;
		q.iterate.limit = iq.before;
	} else {
		q.iterate.limit = iq.after || 256;
	}
	
	return q;
};
