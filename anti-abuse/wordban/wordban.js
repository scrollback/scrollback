/* eslint complexity: 0*/

"use strict";
var SbError = require("../../lib/SbError.js"),
	log = require("../../lib/logger.js"),
	fs = require("fs"),
	filters = {};

fs.readdirSync(__dirname + "/badwords").forEach(function(filename) {
	if (filename === "en" || filename === "hi") {
		filters[filename] = new RegExp("\\b" + fs.readFileSync(
			__dirname + "/badwords/" + filename
		).toString("utf-8").trim().toLowerCase().replace(/\n/g, "|") + "\\b");
	}
});

function check (text, re) {
	return text.toLowerCase()
		.replace(/[4@]/g, "a")
		.replace(/[1]/g, "l")
		.replace(/\$&/g, "s")
		.replace(/\0/g, "o")
		.replace(/\!/g, "i")
		.replace(/* spaces between single characters: l i k e this */)
		.match(re);
}

module.exports = function(core) {

	var actions = [ "text", "user", "room", "edit" ];

	actions.forEach(function(action) {
		core.on(action, function(a, next) {
			var text = [
					(a.id || ""),
					(a.text || ""),
					(a.title || ""),
					(a.to || ""),
					(a.description || "")
				].join(" "),
				appliedFilters = [],
				matches;

			if (action === "text" || action === "edit") {
				var room = a.room;
				log("Heard \"text\" event");
				if (room.params && room.params.antiAbuse && room.params.antiAbuse.spam) {

					if (room.params && room.params.antiAbuse) {
						var customPhrases = room.params.antiAbuse.customPhrases;
						if (customPhrases instanceof Array && customPhrases.join("").length !== 0) {
							filters.custom = new RegExp("\\b" + customPhrases.toString().replace(/,/g, "|") + "\\b");
							appliedFilters.push(filters.custom);
						}
					}

					if (room.params.antiAbuse.block && room.params.antiAbuse.block.english) {

						appliedFilters.push(filters.en);
						appliedFilters.push(filters.hi);
					}

					a.tags = Array.isArray(a.tags) ? a.tags : [];
					matches = appliedFilters.map(function(re) {
						return check(text, re);
					}).filter(function(b)  {return !!b; });
					if (matches.length) {
						if (a.id === a.thread) a.tags.push("thread-hidden");
						a.tags.push("abusive", "hidden");
						log(a);
						return next();
					}

				}
				return next();
			}

			if (action === "room") {
				appliedFilters.push(filters.en);
				appliedFilters.push(filters.hi);
				var limit = 10000;
				log.d("room action:", a);
				matches = appliedFilters.map(function(re) {
					return check(text, re);
				}).filter(function(b)  {return !!b; });

				if (matches.length) {
					return next(new SbError("Abusive_room_name"));
				}

				if (a.room.params && a.room.params.antiAbuse) {
					var c = a.room.params.antiAbuse.customPhrases;
					if (c instanceof Array) {
						if (c.join(" ").length > limit) {
							return next(new Error("ERR_LIMIT_NOT_ALLOWED"));
						}
						next();
					} else {
						next(new Error("INVALID_WORDBLOCK"));
					}
				} else next();
			}

			if (action === "user") {
				appliedFilters.push(filters.en);
				appliedFilters.push(filters.hi);
				matches = appliedFilters.map(function(re) {
					return check(text, re);
				}).filter(function(b)  {return !!b; });
				if (matches.length) {
					return next(new SbError("Abusive_user_name"));
				}

				next();
			}

		}, "antiabuse");
	});
};
