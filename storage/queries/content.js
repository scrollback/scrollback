"use strict";

var pg = require("../../lib/pg.js");

module.exports = [
	function(query) {
		var tableName, filters = [], orderBy, startPosition, direction, limit;

		tableName = (query.type === 'getThreads'? 'threads': 'texts');

		if (query.to) {
			filters.push({ $: "\"to\"=${to}", to: query.to });
		}

		if (query.thread && query.type === 'getTexts') {
			filters.push({ $: "thread=${thread}", thread: query.thread });
		} 

		if (query.tags) {
			filters.push({ $: "tags@>${tags}", tags: query.tags });
		}

		if (!query.user || query.user.role !== "owner" && query.user.role !== "moderator" && query.user.role !== "su") {
			filters.push({ $: 'NOT("tags" @> ${hidden})',
						   hidden: [ query.type === 'getThreads'? "thread-hidden": "hidden" ] });
		}

		if (query.ref) {
			if (Array.isArray(query.ref)) {
				filters.push({ $: "id IN ($(ids))", ids: query.ref });
			} else {
				filters.push({ $: "id=${id}", id: query.ref });
			}
		} else if (query.type === "getThreads" && query.q) {
			filters.push({ $: "terms @@ to_tsquery('english', ${q})", q: query.q });
		} else if (query.updateTime) {
			orderBy = "updatetime";
			startPosition = new Date(query.updateTime);
		} else if (query.type === "getTexts") {
			orderBy = "time";
			startPosition = (query.time ? (new Date(query.time)) : (new Date()));
		} else if (query.type === "getThreads") {
			orderBy = "starttime";
			startPosition = (query.time ? (new Date(query.time)) : (new Date()));
		}

		if(query.after) {
			limit = query.after;
			direction = "ASC";
			filters.push({
				$: "\"" + orderBy + "\" >= ${start}",
				start: startPosition
			});
		} else if(query.before) {
			limit = query.before;
			direction = "DESC";
			filters.push({
				$: "\"" + orderBy + "\" <= ${start}",
				start: startPosition
			});
		} else {
			limit = 256;
		}
		return pg.cat([
			"SELECT * FROM " + tableName + " WHERE",
			pg.cat(filters, " AND "),
			{ $: (orderBy? "ORDER BY " + orderBy + " " + (direction || ""): "") + " LIMIT ${limit}", limit: limit }
		]);
	},
	
	function(query, rows) {
		var results = [];
		if (rows.length) {
			rows.forEach(function(row) {
				var obj = {
					id: row.id,
					to: row.to,
					from: row.from,
					type: (query.type === 'getThreads'? 'thread': 'text'),
					title: row.title,
					text: row.text,
					thread: row.thread,
					color: row.color,
					length: row.length,
					mentions: row.mentions,
					concerns: row.concerns,
					tags: row.tags,
					time: row.time && row.time.getTime(),
					startTime: row.starttime && row.starttime.getTime(),
					updateTime: row.updatetime.getTime(),
					updater: row.updater
				}, propName;
				
				for(propName in obj) if(typeof obj[propName] === "undefined") {
					delete obj[propName];
				}
				
				results.push(obj);
			});

			if (query.before) {
				results.reverse();
			} else if (query.ref instanceof Array) { //order based on ref
				var refMap = {};
				query.ref.forEach(function (ref, i) { refMap[ref] = i; });
				results.sort(function (a, b) { return refMap[a.id] - refMap[b.id]; });
			}
		}
		query.results = results;
	}
];
