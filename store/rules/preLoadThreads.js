var core, config, store;
//var entityOps = require("./../entity-ops.js");

var query;

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;

	query = require("../bulkQuery.js")(core, store, 'threads');

	core.on("setstate", function(changes, next) {
		var user = store.get("user") || "",
			room = store.get("nav", room) || "",
			regex = new RegExp("_" + user + "$");

		if (changes.app && changes.app.featuredRooms) {
			changes.app.featuredRooms.forEach(query);
		}

		if(changes.entities && user) {
			Object.keys(changes.entities).forEach(function(key) {
				if(regex.test(key) && changes.entities[key] && changes.entities[key].room) {
					query(changes.entities[key].room);
				}
			});
		}
		next();
	}, 800);
};





