"use strict";

var pg = require("../../lib/pg.js"),
	log = require("../../lib/logger.js"),
	userOps = require("../../lib/app-utils.js");

module.exports = function (action) {
	var queries = [], updateObject;
	
	log.d("Text:", action);
	// insert text
	if (action.type === "text") {
		queries.push(pg.insert ("texts", {
			id: action.id, 
			from: action.from,
			to: action.to,
			time: new Date(action.time),
			text: action.text,
			thread: action.thread,
			title: action.title,
			tags: action.tags || [],
			mentions: action.mentions,
			upvoters: [],
			flaggers: [],
			updatetime: new Date(action.time),
			updater: action.from
		}));
	} else if(action.type === "edit" && (action.text || action.tags)) {
		updateObject = { updateTime: new Date(action.time) };
		if(action.text) updateObject.text = action.text;
		if(action.tags) updateObject.tags = action.tags;
		
		queries.push(pg.cat([
			pg.update ("texts", updateObject),
			{ $: "WHERE id=${id}", id: action.ref }
		]));
	}
	
	if(action.type === "text" && action.thread) {
		if(action.id === action.thread) {
			queries.push(pg.insert("threads", {
				id: action.thread,
				from: action.from,
				to: action.to,
				title: action.title || action.text,
				color: action.color,
				starttime: new Date(action.time),
				length: 1,
				tags: action.tags || [],
				updatetime: new Date(action.time),
				updater: action.from,
				concerns: [action.from].concat(action.mentions).filter(function(id) {
					return !userOps.isGuest(id);
				})
			}));

		} else {
			queries.push({
				$: "UPDATE threads SET updatetime=${updatetime}, updater=${updater}, length=length+1, " +
					"concerns = concerns || (SELECT array_agg(a.n) FROM (VALUES $(concerns)) AS a(n) " +
					"WHERE NOT (threads.concerns @> ARRAY[a.n])) WHERE id=${id}",
				updatetime: new Date(action.time),
				updater: action.from,
				concerns: [action.from].concat(action.mentions).filter(function(id) {
					return !userOps.isGuest(id);
				}).map(function(id) {
					return [id];
				}),
				id: action.thread
			});

		}
	} else if(action.type === "edit" && (action.title || action.tags)) {
		updateObject = { updateTime: new Date(action.time) };
		if(action.title) updateObject.title = action.title;
		if(action.tags) updateObject.tags = action.tags;
		
		queries.push(pg.cat([
			pg.update ("threads", updateObject),
			{ $: "WHERE id=${id}", id: action.ref }
		]));
	}

	return queries;
};

