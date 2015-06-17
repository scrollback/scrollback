"use strict";

var pg = require("../../lib/pg.js");

/*
	Warning: This does not lock the table or do proper upserts.
	If two inserts are done with the same key very close to each
	other, the second one will fail.
*/

module.exports = function (action) {
	var entity = action[action.type],
		updates, inserts;
	
	if (!(action.old && action.old.id)) {
		// Create a new entity;
		
		inserts = [];
		
		inserts.push({
			$: "INSERT INTO entities" +
				"(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) " + 
				"VALUES (${id}, ${identities}, $(values), to_tsvector('english', ${terms}))",
			values: [
				entity.type, entity.description || "", 0, entity.picture || "", new Date(action.time),
				entity.timezone || 0, entity.locale || "", entity.params, entity.guides				
			],
			terms: entity.id + " " + (entity.description || ""),
			id: entity.id,
			identities: entity.identities? entity.identities.map(function (ident) { return [ident.split(':', 2)[0], ident]; }): []
		});
		
		if(action.type === "room") {
			inserts.push({
				$: "INSERT INTO relations(room, \"user\", role, roletime) VALUES ($(values))",
				values: [ action.room.id, action.user.id, "owner", new Date(action.time) ]
			});
		}
		
		return inserts;
	} else {
		// Update an existing entity;
		
		updates = [];
		['description', 'color', 'picture', 'timezone', 'locale', 'params', 'guides'].forEach(function(p) {
			if(!(p in entity)) { return; }
			var qp = { $: p + "=${" + p + "}" };
			qp[p] = entity[p];
			updates.push(qp);
		});

		if (entity.identities) {
			updates.push({
				$: "identities=${identities}",
				identities: entity.identities.map(function(ident) {
					return [ident.split(':', 2)[0], ident];
				})
			});
		}
		
		if (entity.deleteTime) {
			updates.push({
				$: "deletetime=${deleteTime}",
				deleteTime: new Date(action.time)
			});
		}
		
		if(entity.description) {
			updates.push({
				$: "terms: to_tsvector('english', ${terms})",
				terms: entity.id + " " + (entity.description || "")
			});
		}
		
		return [pg.cat([
			"UPDATE entities SET",
			pg.cat(updates, ", "),
			{ $: "WHERE id=${id}", id: entity.id }
		])];
	}
};

