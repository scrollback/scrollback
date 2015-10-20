/* eslint complexity: 0*/

"use strict";
let SbError = require("../../lib/SbError.js"),
	log = require("../../lib/logger.js"),
	fs = require("fs"),
	filters = {};

fs.readdirSync(__dirname + "/badwords").forEach(filename => {
	if (filename === "en" || filename === "hi") {
		filters[filename] = new RegExp("\\b" + fs.readFileSync(
			__dirname + "/badwords/" + filename
		).toString("utf-8").replace(/\n/g, "|") + "\\b");
	}
});

function check (text, re) {
	return text.toLowerCase()
		.replace(/[4@]/g, "a")
		.replace(/[1]/g, "l")
		.replace(/\$/g, "s")
		.replace(/\0/g, "o")
		.replace(/* spaces between single characters: l i k e this */)
		.match(re);
}

//let appliedFilters = [];
//	appliedFilters.push(filters.en);
//	appliedFilters.push(filters.hi);
//let s = "some kutta random string";
//
//let matches = appliedFilters.map(re => check(s, re)).filter(b => !!b);
//
//if (matches.length) {
//	console.log(matches, appliedFilters);
//}

module.exports = (core) => {

	let actions = [ "text", "user", "room", "edit" ];

	actions.forEach(action => {
		core.on(action, (a, n) => {
			let text = [
					(a.id || ""),
					(a.text || ""),
					(a.to || ""),
					(a.description || "")
				].join(" "),
				title = a.title ? a.title : "",
				appliedFilters = [],
				matches;

			if (action === "text" || action === "edit") {
				let room = a.room;
				log("Heard \"text\" event");
				if (room.params && room.params.antiAbuse && room.params.antiAbuse.spam) {

					if (room.params && room.params.antiAbuse) {
						let customPhrases = room.params.antiAbuse.customPhrases;
						if (customPhrases instanceof Array && customPhrases.length !== 0) {
							filters.custom = new RegExp("\\b" + customPhrases.toString().replace(/,/g, "|") + "\\b");
							appliedFilters.push(filters.custom);
						}
					}

					if (room.params.antiAbuse.block && room.params.antiAbuse.block.english) {

						appliedFilters.push(filters.en);
						appliedFilters.push(filters.hi);
					}

					a.tags = Array.isArray(a.tags) ? a.tags : [];
					matches = appliedFilters.map(re => check(text, re)).filter(b => !!b);
					if (matches.length) {
						log.e(matches, appliedFilters.length);
						a.tags.push("abusive", "hidden");
						log(a);
						return n();
					}

					let m = appliedFilters.map(re => check(title, re)).filter(b => !!b);
					if (m.length) {
						a.tags.push("thread-hidden");
						return n();
					}
				}
				return n();
			}

			if (action === "room") {
				appliedFilters.push(filters.en);
				appliedFilters.push(filters.hi);
				let limit = 10000;
				log.d("room action:", a);
				matches = appliedFilters.map(re => check(text, re)).filter(b => !!b);

				if (matches.length) {
					return n(new SbError("Abusive_room_name"));
				}

				if (a.room.params && a.room.params.antiAbuse) {
					let c = a.room.params.antiAbuse.customPhrases;
					let l = 0;
					if (c instanceof Array) {
						for (let i = 0; i < c.length; i++) {
							let sentance = c[i];
							if (!sentance) {
								c.splice(i, 1);
								i--;
							}
							l += sentance.length;
							if (l > limit) {
								return n(new Error("ERR_LIMIT_NOT_ALLOWED"));
							}
						}
						n();
					} else {
						n(new Error("INVALID_WORDBLOCK"));
					}
				} else n();
			}

			if (action === "user") {
				appliedFilters.push(filters.en);
				appliedFilters.push(filters.hi);
				matches = appliedFilters.map(re => check(text, re)).filter(b => !!b);

				if (matches.length) {
					return n(new SbError("Abusive_user_name"));
				}
			}

		}, "antiabuse");
	});
};
