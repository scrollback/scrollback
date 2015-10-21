"use strict";

// var pg = require("../../lib/pg.js");

/*
	TODO: readTime and dismissTime should be aggregated (MAX) such
	that NULLs remain NULL.


	Use COALESCE
*/

module.exports = [
	function(query) { // Stage 1, group and get notifications
		return {
			$: 	"SELECT \"ref\", \"notetype\", \"score\", \"notedata\", \"group\", \"time\", \"count\"" +
				" FROM (" +
				"SELECT \"ref\", \"notetype\", \"notify\"->>${user} \"score\", \"notedata\", \"group\", \"time\"," +
				"COUNT(*) OVER (PARTITION BY \"notetype\", \"group\" ) \"count\"," +
				"RANK() OVER (PARTITION BY \"notetype\", \"group\" ORDER BY \"time\" DESC) timeRank " +
				"FROM notes " +
				"WHERE \"notify\" ? ${user}" +
				") t" +
				" WHERE \"count\" <= 2 OR timeRank = 1;",
			user: query.user.id
		};
	},
	function(query, results) { // Stage 2, result transform
		query.results = (query.results ? query.results : []).concat(results.map(function(row) {
			return {
				noteType: row.notetype,
				group: row.group,
				ref: row.ref,
				score: parseInt(row.score),
				time: row.time.getTime(),
				noteData: row.notedata,
				count: parseInt(row.count)
			};
		})).sort(function(a, b) {
			return b.time - a.time;
		});
	}
];
