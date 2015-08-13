"use strict";

var pg = require("../../lib/pg.js");
var log = require('./../../lib/logger.js');

/*
	Warning: This does not lock the table or do proper upserts.
	If two inserts are done with the same key very close to each
	other, the second one will fail.
*/

module.exports = function(action) {
	var entity, insertObject, updateObject = {},
		whereObject = {},
		col;
	var inserts = [], query = [];

	if (action.type === 'init') entity = action.user;
	else entity = action[action.type];

	insertObject = {
		id: entity.id,
		type: entity.type,
		identities: entity.identities || [],
		color: entity.color,
		picture: entity.picture,
		createtime: new Date(entity.createTime),
		timezone: entity.timezone,
		locale: entity.locale,
		params: entity.params,
		guides: entity.guides,
		terms: entity.terms
	};


	if (action.type === 'user' || action.type === 'init' ) {
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
		if (col !== 'id') {
			updateObject[col] = insertObject[col];
		} else {
			whereObject[col] = insertObject[col];
		}
	}


	query.push(pg.lock([insertObject.id]));
	log.d("to insert: ", insertObject);
	query.push(pg.cat([pg.update("entities", insertObject), "WHERE", pg.nameValues(whereObject, " AND ")]));

	inserts.push({
		$: "INSERT INTO entities" +
			"(id, identities, type, description, color, picture, createtime, timezone, locale, params, guides, terms) " +
			"select ${id}, ${identities}, ${type}, ${description}, ${color}, ${picture},$(createTime)," +
			"${timezone}, ${locale}, ${params}, ${guides}," +
			"to_tsvector('english', ${terms})",
		type: insertObject.type,
		description: insertObject.description || "",
		color: 0,
		picture: insertObject.picture || "",
		createTime: new Date(action.time),
		timezone: insertObject.timezone || 0,
		locale: insertObject.locale || "",
		params: insertObject.params,
		guides: insertObject.guides,
		terms: insertObject.id + " " + (entity.description || ""),
		id: insertObject.id,
		identities: insertObject.identities
	});

	inserts.push({
		$: "WHERE NOT EXISTS (SELECT 1 FROM entities WHERE id = ${id})",
		id: insertObject.id
	});

	if (action.type === "room" && (!action.old || !action.old.id)) {
		inserts.push({
			$: "INSERT INTO relations(room, \"user\", role, roletime) VALUES ($(values))",
			values: [action.room.id, action.user.id, "owner", new Date(action.time)]
		});
	}

	query.push(pg.cat(inserts));
	return query;
};
