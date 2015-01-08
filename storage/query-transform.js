var log = require('../lib/logger.js');
/**
select * from texts where time > 123456373 and "from"='roomname' and time > text.room.createTime && order by time desc limit 256 
only non [hidden].
 
if delete time is set.

*/
function makeQuery(type) {
	function quantFilter(col, fob) {
		var filters = this.filters;
		
		if(typeof fob !== 'object') {
			filters.push([col, 'eq', fob]);
			return;
		}

		['eq', 'neq', 'lt', 'lte', 'gt', 'gte'].forEach(function(op) {
			if (fob.hasOwnProperty(op)) {
				filters.push([col, op, fob[op]]);
				return;
			}
		});
	}
	
	return { sources: [], type: type, filters: [], iterate: {
		key: null, start: null, reverse: false, skip: 0, limit: 256
	}, quantFilter: quantFilter };
}

// Content queries: texts, threads.

exports.getTexts = exports.getThreads = function(query) {
	var q = makeQuery();
	q.sources.push(query.type == 'getThreads'? 'threads': 'texts');
	
	if(query.to) {
		q.filters.push(["to", "eq", query.to]);
	}
	
	if(query.thread && query.type === 'getTexts') {
		q.filters.push(["thread", "eq", query.thread]);
	}
	
	if(query.label) {
		q.filters.push(["label", "propgt", query.label, 0.5]);
	}
	
	if (query.updateTime) {
		q.iterate.key = "updateTime";
		q.iterate.start = query.updateTime;
	} else if (query.type == 'getThreads' && query.q) {
//		TODO: TEXT SEARCH
//		q.filters.push(["terms", "ts", iq.q]);
//		q.iterate.key = ["tsrank" "terms", iq.q];
//		
//		Maybe it won't go here at all.
	} else {
		q.iterate.key = "time";
		q.iterate.start = query.time || new Date().getTime();
	}
	
	if(query.before) {
		q.iterate.reverse = true;
		q.iterate.limit = query.before;
	} else {
		q.iterate.limit = query.after || 256;
	}
	return q;
};

// Entity queries: rooms, users.

/**
select * from entities INNER JOIN relations on (relations.user=entities.id AND relations.role='follower' AND relations.user='russeved');
*/

exports.getEntities = exports.getRooms = exports.getUsers = function (iq) {
	var q = makeQuery('select'),
		type = (iq.type === 'getEntities' ? undefined : (iq.type === 'getUsers' ? 'user' : 'room'));
	
	q.sources.push('entities');
	q.source = "entities";
	if (iq.ref) {
		q.filters.push(["id", "eq", iq.ref]);
	}
    
	if (iq.type) {
		q.filters.push(["type", "eq", type]);
	}
	
    if (iq.identity) {
		q.filters.push('identities', 'cts', [iq.identity]);
	}
	
	if (iq.memberOf) {
		q.sources.push(['relations', 'user']);
		q.filters.push(['room', 'eq', iq.memberOf]);
	}
	
	if (iq.hasMember) {
		q.sources.push(['relations', 'room']);
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
	
	if (iq.before) {
		q.iterate.reverse = true;
		q.iterate.limit = iq.before;
	} else {
		q.iterate.limit = iq.after || 256;
	}
	log.d("entities Query:", q);
	return [q];
};
