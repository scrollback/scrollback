"use strict";

var pglib = require("./psqllib.js");

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
				entity.type, entity.description || "", 0, entity.picture, new Date(action.time),
				entity.timezone || 0, entity.locale || "", entity.params, entity.guides				
			],
			terms: entity.id + " " + (entity.description || ""),
			id: entity.id,
			identities: entity.identities? entity.identities.map(function (ident) { return [ident.split(':', 2)[0], ident]; }): []
		});
		
		if(action.type === "room") {
			inserts.push({
				$: "INSERT INTO relations(room, user, role, roletime) VALUES ($(values))",
				values: [ action.room.id, action.user.id, "owner", new Date(action.time) ]
			});
		}
		
		return inserts.map(pglib.paramize);
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
		
		return [pglib.join(["UPDATE entities SET"].concat(
			updates,
			[{ $: "WHERE id=${id}", id: entity.id }]
		))].map(pglib.paramize);
	}
};


/*

TODO 1. if delete time is set then update the type also.
2. check if identities array is a set.

exports.room = exports.user = function (action) {

	var entity = action[action.type],
		put = makePut('upsert', 'entities'),
		putOwner = makePut('insert', 'relations');
	put.lock = entity.id;
	put.insert = {
		id: entity.id,
		type: action.type,
		description: entity.description,
		picture: entity.picture,

		identities: entity.identities.map(function(ident) {
			return [ident.split(':', 2)[0], ident];
		}),
		timezone: entity.timezone,
		//locale: entity.locale,
		params: entity.params,
		guides: entity.guides
	};
	put.filters.push(['id', 'eq', entity.id]);
	['description', 'picture', 'timezone', 'params', 'guides'].forEach(function(p) {
			// column name in database are lower case of property name of entity.
			put.update.push([p.toLowerCase(), 'set', entity[p]]);
	});

	if (entity.identities) {
		put.update.push(['identities', 'set', entity.identities.map(function(ident) {
			return [ident.split(':', 2)[0], ident];
		})]);
	}
	if (entity.createTime) {
		put.update.push(['createtime', 'set', new Date(entity.createTime)]);
		put.insert.createtime = new Date(entity.createTime);
	}
	if (entity.deleteTime) {
		put.update.push(['deletetime', 'set', new Date(entity.deleteTime)]);
		put.insert.deletetime = new Date(entity.deleteTime);
	}
	var ret = [put];
	if ((!(action.old && action.old.id)) && (action.type === 'room')) { // add relationship role = owner
		putOwner.insert = {
			room: action.room.id,
			user: action.user.id,
			role: "owner",
			roletime: new Date(action.time)
		};
		ret.push(putOwner);
	}
	return ret;
};

*/