"use strict";

// var pg = require("../../lib/pg.js");


/*
	TODO: readTime and dismissTime should be aggregated (MAX) such
	that NULLs remain NULL.
	
	
	Use COALESCE
*/

module.exports = [
	function (query) { // Stage 1, group and get notifications
		return {
			$:	"SELECT \"action\", \"notetype\", \"group\", " +
				"MAX(\"score\") as \"score\", MAX(\"time\") AS \"time\", " +
				"COUNT(*) AS \"count\", " +
				"CASE WHEN MAX(COALESCE(readtime, '2050-01-01')) = '2050-01-01'" +
				"THEN NULL ELSE MAX(readtime) END AS readtime " +
				"FROM notes WHERE \"user\"=${user} AND dismissTime IS NULL " +
				"GROUP BY \"action\", \"notetype\", \"group\"",
			
			user: query.user.id
		};
	},
	
	function (query, results) { // Stage 2, expand small groups
		var smallGroups = [];
		
		query.results = [];
		results.forEach(function (row) {
			if(row.count < 3) {
				smallGroups.push(row.group);
			} else {
				query.results.push({
					user: query.user.id,
					action: row.action,
					noteType: row.notetype,
					group: row.group,
					score: row.score,
					time: row.time.getTime(),
					readTime: row.readtime && row.readtime.getTime(),
					count: row.count
				});
			}
		});
		
		if (smallGroups.length) {
			return {
				$:	"SELECT action, notetype, ref, \"group\", score, " +
					"time, readtime, notedata " +
					"FROM notes WHERE \"user\"=${user} AND dismissTime IS NULL " +
					"AND \"group\" IN ($(groups))",

				user: query.user.id,
				groups: smallGroups
			};
		} else {
			return null;
		}
	},
	
	function (query, results) { // Stage 3, result transform
		query.results = query.results.concat(results.map(function (row) {
			return {
				user: query.user.id,
				action: row.action,
				noteType: row.notetype,
				group: row.group,
				ref: row.ref,
				score: row.group,
				time: row.time.getTime(),
				noteData: row.notedata,
				count: 1
			};
		})).sort(function (a, b) {
			return b.time - a.time;
		});
	}
];
