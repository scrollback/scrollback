"use strict";
var core,
	log = require("../lib/logger.js"),
	uid = require('../lib/generate.js').uid;

function loadEntity(id, type, session, callback) {
	log.d("got request for "+type, id);
	core.emit("getEntities", {
		id: uid(),
		ref: id,
		session: session
	}, function(err, response) {
		var entity;
		if (err || !response || !response.results || !response.results.length) return callback(new Error("NO_" + type.toUpperCase() + "_WITH_GIVEN_ID"));

		entity = response.results[0];
		if (entity.type !== "room") return callback(new Error("ID_SPECIFIED_IS_USER"));

		callback(null, entity);
	});
}

function exp(c) {
	core = c;
	return loadEntity;
}

module.exports = exp;
