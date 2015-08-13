"use strict";

var pg = require("../../lib/pg.js");
var log = require('./../../lib/logger.js');
var sessionUtils = require("../../lib/session-utils.js");

module.exports = [
	function (query) {
		var type,
			filters = [],
			source = "entities",
			limit, orderBy, startPosition;

		if(query.type === 'getUsers') {
			type = 'user';
		} else if(query.type === 'getRooms') {
			type = 'room';
		} else if(query.memberOf || query.occupantOf) {
			type = null; // 'user'; // Postgres query planner picks a slower join strategy if off-index where conditions are specified on both tables.
		} else if(query.hasMember || query.hasOccupant) {
			type = null; // 'room';
		}

		if (type) {
			filters.push({$: "entities.type=${type}", type: type });
		}

		if (query.ref) {
			if (Array.isArray(query.ref)) {
				filters.push({ $: "entities.id IN ($(ids))", ids: query.ref.map(function (e){
					return e.replace(/^guest-/,"");
				})});
			} else if(/\*$/.test(query.ref)) {
				orderBy = "id";
				if(!query.limit || query.limit>10) query.limit = 10;
				filters.push({ $: "entities.id like ${id}", id: query.ref.replace(/\**$/,"%") });
			} else {
				filters.push({ $: "entities.id=${id}", id: query.ref.replace(/^guest-/,"") });
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
				if (query.memberOf && /^owner|moderator|su$/.test(query.user.role) || query.hasMember === query.user.id || query.hasMember &&  sessionUtils.isInternalSession(query.session)) {
					// Show people who are transitioning to a visible role and
					// rooms the current user is in the process of joining
					roleFilters.push("relations.transitionrole > 'none' OR relations.role = 'banned'");
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
		} else if(query.limit) {
			limit = query.limit;
		} else {
			limit = null; // 256;
		}
		return pg.cat([
			"SELECT * FROM " + source + " WHERE",
			pg.cat(filters, " AND "),
			{ $: (orderBy? "ORDER BY " + orderBy : "") + (limit? " LIMIT ${limit}": ""), limit : limit }
		]);
	},

	function(query, entities) {
		var results = [];
		if (entities.length) {
			entities.forEach(function(row) {
				var identities = [];
				log.d("row identity", row);
				
				if(row.identities) {
					row.identities.forEach(function(identity) {
						log.d("identity", identity);
						identities.push(identity[1]);
					});
				}
				
				log.d("row identity", identities, row);
				var entity = {
					id: row.id,
					type: row.type,
					createTime: (row.createtime ? row.createtime.getTime() : null),
					description: row.description,
					identities: identities,
					params: row.params,
					guides: row.guides,
					picture: row.picture,
					timezone: row.timezone,
					role: row.role,
					roleSince: row.roletime
				};
				if(row.transitiontype) entity.transitionType = row.transitiontype;
				if(row.transitionrole) entity.transitionRole = row.transitionrole;
				if(row.officer) entity.officer = row.officer;
				results.push(entity);
			});

			if (query.before) {
				results.reverse();
			} else if (query.ref instanceof Array) {
				var refMap = {};
				query.ref.forEach(function (ref, i) { refMap[ref] = i; });
				results.sort(function (a, b) { return refMap[a.id] - refMap[b.id]; });
			}
		}

		query.results = results;
	}


];
