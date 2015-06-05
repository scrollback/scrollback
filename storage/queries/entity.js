"use strict";

var pg = require("../../lib/pg.js");

module.exports = function (query) {
	var type,
		filters = [],
		source = "entities",
		limit, orderBy, startPosition;
	
	if(query.type === 'getUsers') {
		type = 'user';
	} else if(query.type === 'getRooms') {
		type = 'room';
	} else if(query.memberOf || query.occupantOf) {
		type = 'user';
	} else if(query.hasMember || query.hasOccupant) {
		type = 'room';
	}
	
	if (type) {
		filters.push({$: "entities.type=${type}", type: type });
	}
	
	if (query.ref) {
		if (Array.isArray(query.ref)) {
			filters.push({ $: "entities.id IN ($(ids))", ids: query.ref });
		} else {
			filters.push({ $: "entities.id=${id}", id: query.ref });
		}
	}
	
	if (query.identity) {
		filters.push({ $: "entities.identities @> ${identities}", identities: [query.identity] });
	} else if (query.timezone) {
		if (typeof query.timezone.gte === 'number') {
			filters.push({ $: "entities.timezone >= ${mintz}", mintz: query.timezone.gte });
		}
		if (typeof query.timezone.lte === 'number') {
			filters.push({ $: "entities.timezone <= ${maxtz}", maxtz: query.timezone.lte });
		}
	} else if (query.memberOf || query.hasMember) {
		source = "entities " + (query.ref? "LEFT OUTER": "INNER") + 
			" JOIN relations ON (entities.id=relations." + type + ")";
		
		if (query.memberOf) {
			filters.push({ $: "relations.room=${room}", room: query.memberOf });
		} else if (query.hasMember) {
			filters.push({ $: "relations.user=${user}", user: query.hasMember });
		}
		
		if (query.role) {
			filters.push({ $: "relations.role=${role}'", role: query.role });
		} else {
			var roleFilters = ["relations.role > 'none'"];
			
			if (query.memberOf && /^owner|moderator|su$/.test(query.user.role) || query.hasMember === query.user.id) {
				// Show people who are transitioning to a visible role and
				// rooms the current user is in the process of joining
				roleFilters.push("relations.transitionrole > 'none'");
			} else if (query.memberOf) {
				// Add the current user if in the process of joining
				roleFilters.push({ $: "(relations.user = ${me} AND relations.transitionrole > 'none')", me: query.user.id });
			}
			
			filters.push(pg.cat(["(", pg.cat(roleFilters, " OR "), ")"]));
		}
		
		
	}

	if (query.createTime) {
		orderBy = "entities.createtime";
		startPosition = new Date(query.createTime);
	} else if (query.roleTime) {
		orderBy = "relations.roletime";
		startPosition = new Date(query.roleTime);
	} /* else if (query.q) {
		
	}
	
	*/
	
	if(query.after) {
		limit = query.after;
		filters.push({
			$: "\"" + orderBy + "\" >= ${start}",
			start: startPosition
		});
	} else if(query.before) {
		limit = query.before;
		filters.push({
			$: "\"" + orderBy + "\" <= ${start}",
			start: startPosition
		});
	} else {
		limit = 256;
	}
	return pg.cat([
		"SELECT * FROM " + source + " WHERE",
		pg.cat(filters, " AND "),
		{ $: (orderBy? "ORDER BY " + orderBy : "") + " LIMIT ${limit}", limit: limit }
	]);
};
