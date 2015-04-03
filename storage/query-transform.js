var log = require('../lib/logger.js');
/**
select * from texts where time > 123456373 and "from"='roomname' and time > text.room.createTime && order by time desc limit 256 
only non [hidden].

if delete time is set.

*/
function makeQuery(type) {
	return { sources: [], type: type, filters: [], iterate: {
		keys: [], start: [], reverse: false, skip: 0, limit: 256
	} };
}

// Content queries: texts, threads.

exports.getTexts = exports.getThreads = function(query) {
	log("query:", query);
	var q = makeQuery('select');
	q.source = (query.type === 'getThreads'? 'threads': 'texts');
	
	if (query.to) {
		q.filters.push(["to", "eq", query.to]);
	}
	
	if (query.thread && query.type === 'getTexts') {
		q.filters.push(["thread", "eq", query.thread]);
	} 
	
	if (query.tag) {
		q.filters.push(["tags", "cts", query.tag]);
	}
	
	if (!query.user || query.user.role !== "owner" && query.user.role !== "moderator") {
		q.filters.push({sql: 'NOT("tags" @> $)', values: [[
			q.type === 'getThreads'? "thread-hidden": "hidden"
		]]});
		
		log.d("HIDDEN EXCLUDED", q.filters);
	}
	
	if (query.ref) {
		if (query.ref instanceof Array) {
			if (query.ref.length) q.filters.push(['id', 'in', query.ref]);	
			else return []; // no results.
		} else q.filters.push(["id", "eq", query.ref]);
	} else if (query.updateTime) {
		q.iterate.keys.push("updatetime");
		q.iterate.start.push(new Date(query.updateTime));
	} else if (query.type === "getTexts") {
		q.iterate.keys.push("time");
		q.iterate.start.push(query.time ? (new Date(query.time)) : (new Date()));
	} else if (query.type === "getThreads") {
		q.iterate.keys.push("starttime");
		q.iterate.start.push(query.time ? (new Date(query.time)) : (new Date()));
	}
	/*else if (query.type == 'getThreads' && query.q) {
		TODO: TEXT SEARCH
		q.filters.push(["terms", "ts", iq.q]);
		q.iterate.key = ["tsrank" "terms", iq.q];
		
		Maybe it won't go here at all.
	}*/
	
	if(query.after) {
		q.iterate.limit = query.after;
		q.iterate.reverse = false;
	} else if(query.before) {
		q.iterate.reverse = true;
		q.iterate.limit = query.before;
	} else {
		q.iterate.limit = 256;
	}
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
	
	if (type) {
		q.filters.push([["entities", "type"], "eq", type]);
	}
	if (iq.ref) {
		if (iq.ref instanceof Array ) {
			if (iq.ref.length) q.filters.push(['id', 'in', iq.ref]);
			else return []; // no results because ref is an empty array. 
		} else q.filters.push(["id", "eq", iq.ref]);
	} 
	if (iq.identity) {
		q.filters.push(['identities', 'cts', [iq.identity]]);
	} else if (iq.timezone) {
		if (typeof iq.timezone.gte === 'number') q.filters.push(['timezone', 'gte', iq.timezone.gte]);
		if (typeof iq.timezone.lte === 'number') q.filters.push(['timezone', 'lte', iq.timezone.lte]);
	} else if (iq.memberOf || iq.hasMember) {
		q.sources.push('entities');
		q.sources.push('relations');
		if (!iq.role) {
			q.filters.push([['relations', 'role'], 'gt', 'none']);
		} else {
			q.filters.push([['relations', 'role'], 'eq', iq.role]);
		}
		if (iq.memberOf) {
			q.filters.push([['relations', 'room'], 'eq', iq.memberOf]);
			q.filters.push([['relations', 'user'], 'eq', ['entities', 'id'], 'column']);
		} else if (iq.hasMember) {
			q.filters.push([['relations', 'user'], 'eq', iq.hasMember]);
			q.filters.push([['relations', 'room'], 'eq', ['entities', 'id'], 'column']);	
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
		q.iterate.limit = iq.after || 20000; // TODO: temp fix. need to create iterators for these kind of queries.
		q.iterate.reverse = false;
	}
	return [q];
};
