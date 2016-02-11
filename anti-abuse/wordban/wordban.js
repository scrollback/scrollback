/* eslint complexity: 0*/

"use strict";
var SbError = require("../../lib/SbError.js"),
	log = require("../../lib/logger.js"),
	regReplace = require("../../lib/regex-utils.js"),
	fs = require("fs"), bannedUsers,
	filters = {};

fs.readdirSync(__dirname + "/badwords").forEach(function(filename) {
	if (filename === "en" || filename === "hi") {
		filters[filename] = new RegExp("\\b" + fs.readFileSync(
			__dirname + "/badwords/" + filename
		).toString("utf-8").trim().toLowerCase().split("\n").map(function(e) {
			return "\\b" + e + "\\b";
		}).join("|") + "\\b");
	}
});

function check (text, re) {
	return text.toLowerCase()
		.replace(/[4@]/g, "a")
		.replace(/[1]/g, "l")
		.replace(/\$&/g, "s")
		.replace(/\0/g, "o")
		.replace(/\!/g, "i")
//		.replace(/* spaces between single characters: l i k e this */)
		.match(re);
}

module.exports = function(core, config) {
	bannedUsers = config.global.bannedUsers;
	var actions = [ "text", "user", "room", "edit" ];

	actions.forEach(function(action) {
		core.on(action, function(a, next) {
			var text = [
//					(a.id || ""),
					(a.from || ""),
					(a.text || ""),
					(a.title || ""),
					(a.to || "")
				].join(" "),
				appliedFilters = [],
				matches;

			if (action === "text" || action === "edit") {
				var room = a.room;
				log.i("Heard \"text\" event", a);
				if (room.params && room.params.antiAbuse && room.params.antiAbuse.spam) {
					if (bannedUsers) {
						filters.bannedUsers = new RegExp("\\b" + bannedUsers.map(function (e){
							return "\\b" + e + "\\b";
						}).join("|") + "\\b");
						appliedFilters.push(filters.bannedUsers);
					}

					if (room.params && room.params.antiAbuse) {
						var customPhrases = room.params.antiAbuse.customPhrases;
						if (customPhrases instanceof Array && customPhrases.length !== 0) {
							filters.custom = new RegExp("\\b" + customPhrases.map(function(e) {
								return "\\b" + regReplace.escape(e) + "\\b";
							}).join("|") + "\\b");
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
					log.i(matches, text);
					if (matches.length) {
						if (a.id === a.thread) a.tags.push("abusive", "thread-hidden");
						a.tags.push("abusive", "hidden");
						return next();
					}
				}
				return next();
			}

			if (action === "room") {
				text = text + " " + a.room.description;
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

					if (Array.isArray(c)) {
						a.room.params.antiAbuse.customPhrases = c.filter(function (b) {
							return b.trim();
						});

						if (a.room.params.antiAbuse.customPhrases.join(" ").length > limit) {
							return next(new Error("ERR_LIMIT_NOT_ALLOWED"));
						}
						next();
					} else {
						next(new Error("INVALID_WORDBLOCK"));
					}
				} else next();
			}

			if (action === "user") {
				text = text + " " + a.user.description;
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
