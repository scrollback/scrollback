"use strict";

var pg = require("../../lib/pg.js");
var log = require('./../../lib/logger.js');
var userUtils = require('../../lib/user-utils.js');

/*
	Warning: This does not lock the table or do proper upserts.
	If two inserts are done with the same key very close to each
	other, the second one will fail.
*/

module.exports = function(action) {
	var entity,
		insertObject,
		updateObject = {},
		whereObject = {},
		col;
	var query = [];

	if (action.type === 'init') entity = action.user;
	else entity = action[action.type];

	insertObject = {
		id: entity.id,
		type: entity.type,
		description: entity.description || "",
		identities: entity.identities || [],
		color: entity.color || 0,
		picture: entity.picture,
		createTime: new Date(action.time),
		timezone: entity.timezone,
		locale: entity.locale,
		params: entity.params,
		guides: entity.guides,
		terms: entity.id + " " + (entity.description || "")
	};


	if (action.type === 'user' || action.type === 'init') {
		if (/^guest-/.test(action.user.id)) {
			action.user.identities = action.user.identities || [];
			if (action.user.identities.indexOf("guest:" + action.user.id) < 0) {
				action.user.identities.push("guest:" + action.user.id);
			}
			insertObject.id = insertObject.id.replace(/^guest-/, "");
			insertObject.identities = action.user.identities;
		}
	}

	insertObject.identities = insertObject.identities.map(function(ident) {
		return [ident.split(':', 2)[0], ident];
	});

	for (col in insertObject) {
		if (col === 'id') {
			whereObject[col] = insertObject[col];
		} else if (col !== 'createTime' && col !== 'terms') {
			updateObject[col] = insertObject[col];
		}
	}


	query.push(pg.lock([insertObject.id]));
	log.d("to insert: ", insertObject);



	updateObject = pg.cat([
	 "UPDATE entities SET",
	 pg.nameValues(updateObject, ", "),
		{
			$: ", \"terms\"=to_tsvector('english', ${terms})",
			terms: insertObject.terms
		},
	 "WHERE",
	 pg.nameValues(whereObject, " AND ")
	]);
	
	query.push(updateObject);
	insertObject.$ = "INSERT INTO entities" +
		"(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) " +
		"SELECT ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture}, ${createTime}," +
		"${timezone}, ${locale}, ${params}, ${guides}, to_tsvector('english', ${terms})";

	query.push(pg.cat([insertObject, {
		$: "WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})",
		id: insertObject.id
	}]));

	if (action.type === "user" && action.old && action.user.id !== action.old.id && userUtils.isGuest(action.old.id)) {
		query.push({
			$: "delete from entities where id=${oldId}",
			oldId: action.old.id.replace(/^guest-/, "")
		});
	}


	if (action.type === "room" && (!action.old || !action.old.id)) {
		query.push({
			$: "INSERT INTO relations(room, \"user\", role, roletime) VALUES ($(values))",
			values: [action.room.id, action.user.id, "owner", new Date(action.time)]
		});
	}
	
	return query;
};
