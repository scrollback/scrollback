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
			$: 	"SELECT \"ref\", \"notetype\", \"user\", \"score\", \"notedata\", \"group\", \"time\", \"count\"" +
				" FROM (" +
    			"SELECT *," +
        		"COUNT(*) OVER (PARTITION BY \"user\", \"notetype\", \"group\" ) \"count\"," +
        		"RANK() OVER (PARTITION BY \"user\", \"notetype\", \"group\" ORDER BY \"time\" DESC) timeRank " +
    			"FROM notes " +
    			"WHERE \"user\" = ${user} AND dismisstime IS NULL"+
				") t"+
				" WHERE \"count\" <= 3 OR timeRank = 1;",
			user: query.user.id
		};
	},
	function (query, results) { // Stage 2, result transform
		query.results = (query.results?query.results:[]).concat(results.map(function (row) {
			return {
				user: query.user.id,
				action: row.action,
				noteType: row.notetype,
				group: row.group,
				ref: row.ref,
				score: row.group,
				time: row.time.getTime(),
				noteData: row.notedata,
				count: row.count
			};
		})).sort(function (a, b) {
			return b.time - a.time;
		});
	}
];
