var log = require('../lib/logger.js'),
	storageUtils = require('./storage-utils.js');
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
		keys: [], start: [], reverse: false, skip: 0, limit: 256
	}, quantFilter: quantFilter };
}

// Content queries: texts, threads.

exports.getTexts = exports.getThreads = function(query) {
	var q = makeQuery('select');
	q.source = (query.type === 'getThreads'? 'threads': 'texts');
	
	if (query.to) {
		q.filters.push(["to", "eq", query.to]);
	}
	
	if (query.thread && query.type === 'getTexts') {
		q.filters.push(["thread", "eq", query.thread]);
	} else if (query.tag) {
		q.filters.push(["tags", "cts", query.tag]);
	} else if (query.ref) {
		if (query.ref instanceof Array) {
			q.filters.push(['id', 'in', query.ref]);	
		} else q.filters.push(["id", "eq", query.ref]);
	} else if (query.updateTime) {
		q.iterate.keys.push("updatetime");
		q.iterate.start.push(new Date(query.updateTime));
	} /*else if (query.type == 'getThreads' && query.q) {
//		TODO: TEXT SEARCH
//		q.filters.push(["terms", "ts", iq.q]);
//		q.iterate.key = ["tsrank" "terms", iq.q];
//		
//		Maybe it won't go here at all.
	}*/ else {
		q.iterate.keys.push("time");
		q.iterate.start.push(storageUtils.timetoString(query.time || new Date().getTime()));
	}
	
	if(query.before) {
		q.iterate.reverse = true;
		q.iterate.limit = query.before;
	} else {
		q.iterate.limit = query.after || 256;
		q.iterate.reverse = false;
	}
	log.d("Query:", q);
	return [q];
};

// Entity queries: rooms, users.

/**
select * from entities INNER JOIN relations on (relations.user=entities.id AND relations.role='follower' AND relations.user='russeved');
*/

exports.getEntities = exports.getRooms = exports.getUsers = function (iq) {
	var q = makeQuery('select'),
		type = (iq.type === 'getEntities' ? undefined : (iq.type === 'getUsers' ? 'user' : 'room'));
	q.source = "entities";
	
    
	if (iq.type) {
		q.filters.push([["entities", "type"], "eq", type]);
	}
	if (iq.ref) {
		if (iq.ref instanceof Array) {
			q.filters.push(['id', 'in', iq.ref]);	
		} else q.filters.push(["id", "eq", iq.ref]);
	} else if (iq.identity) {
		q.filters.push(['identities', 'cts', [iq.identity]]);
	} else if (iq.timezone) {
		if (typeof iq.timezone.gte === 'number') q.filters.push(['timezone', 'gte', iq.timezone.gte]);
		if (typeof iq.timezone.lte === 'number') q.filters.push(['timezone', 'lte', iq.timezone.lte]);
	} else if (iq.memberOf || iq.hasMember) {
		q.sources.push('entities');
		q.sources.push('relations');
		if (!iq.role) {
			q.filters.push([['relations', 'role'], 'neq', 'none']);
		} else {
			q.filters.push([['relations', 'role'], 'eq', iq.role]);
		}
		if (iq.memberOf) {
			q.filters.push([['relations', 'room'], 'eq', iq.memberOf]);
			q.filters.push([['relations', 'user'], 'eq', ['entities', 'id']]);
		} else if (iq.hasMember) {
			q.filters.push([['relations', 'user'], 'eq', iq.hasMember]);
			q.filters.push([['relations', 'room'], 'eq', ['entities', 'id']]);	
		}
	} else if (iq.role) q.filters.push(['role', 'eq', q.role]);
	
	
	
	
	//if (iq.locale) q.quantFilter('locale', iq.locale);
	
/*	if (iq.roleTime) {
		q.iterate.key = 'roleTime';
		q.iterate.start = iq.roleTime;
	} else */
	if (iq.createTime) {
		q.iterate.keys.push('createtime');
		q.iterate.start.push(new Date(iq.createTime));
	} else if(!iq.ref) { // alphabetical order
		q.iterate.keys.push('id');
		q.iterate.start.push(iq.iterator || "");
	}
	
	
	if (iq.before) {
		q.iterate.reverse = true;
		q.iterate.limit = iq.before;
	} else {
		q.iterate.limit = iq.after || 256;
		q.iterate.reverse = false;
	}
	log.d("entities Query:", q);
	return [q];
};
