"use strict";

var writeEntity = require("./actions/entity"),
	writeRelation = require("./actions/relation"),
	writeContent = require("./actions/content"),
	writeNote = require("./actions/note"),
	deleteEntity = require("./actions/deleteUser.js"),
	readEntity = require("./queries/entity"),
	readContent = require("./queries/content"),
	readNote = require("./queries/note"),
	log = require('./../lib/logger.js'),
	pg = require("../lib/pg"),
	connString;

function handleEntityAction(action, next) {
	log("init reached storage", action);
	var sql = writeEntity(action).concat(writeNote(action));

	pg.write(connString, sql, function(err) {
		log("init: user update done", action);
		next(err);
	});
}


function handlePresenseAction(action, next) {
	var sql;
	log.d("away action:", action);
	if (action.type === "away" && action.deleteGuestNow) {
		sql = deleteEntity(action);
		log.d("delete on away action:", action);
		pg.write(connString, sql, function(err) {
			next(err);
		});
	} else {
		next();
	}
}

function handleRelationAction(action, next) {
	var sql = writeRelation(action).concat(writeNote(action));
	pg.write(connString, sql, function(err) {
		next(err);
	});
}

function handleContentAction(action, next) {
	var sql = writeContent(action).concat(writeNote(action));

	pg.write(connString, sql, function(err) {
		next(err);
	});
}

function runQuery(handlers, query, results, i, callback) {
	var sql;
	if (i < handlers.length && (sql = handlers[i](query, results))) {
		log.d(sql);
		pg.read(connString, sql, function(err, res) {
			if (err) return callback(err);
			runQuery(handlers, query, res, i + 1, callback);
		});
	} else {
		callback();
	}
}

function handleEntityQuery(query, next) {
	log.d("Received Query:", query);
	if (query.results) return next();
	runQuery(readEntity, query, null, 0, next);
}

function handleContentQuery(query, next) {
	if (query.results) return next();
	runQuery(readContent, query, null, 0, next);
}

function handleNoteQuery(query, next) {
	if (query.results) return next();
	runQuery(readNote, query, null, 0, next);
}

function handleNoteAction(action, next) {
	var sql = writeNote(action);

	pg.write(connString, sql, function(err) {
		next(err);
	});
}
module.exports = function(core, config) {
	connString = "pg://" + config.pg.username + ":" +
		config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

	require('./timestamp.js')(core, config);
	// timestamp.js ensures that timestamps of texts and threads are unique in
	// a room (by incrementing by one or two milliseconds where they don't)
	// Assumes that no room has hundreds of messages a second.

	core.on("room", handleEntityAction, "storage");
	core.on("user", handleEntityAction, "storage");
	core.on("init", handleEntityAction, "storage");

	core.on("text", handleContentAction, "storage");
	core.on("edit", handleContentAction, "storage");

	core.on("join", handleRelationAction, "storage");
	core.on("part", handleRelationAction, "storage");
	core.on("admit", handleRelationAction, "storage");
	core.on("expel", handleRelationAction, "storage");

	core.on("away", handlePresenseAction, "storage");
	core.on("note", handleNoteAction, "storage");

	core.on("getRooms", handleEntityQuery, "storage");
	core.on("getUsers", handleEntityQuery, "storage");
	core.on("getEntities", handleEntityQuery, "storage");

	core.on("getTexts", handleContentQuery, "storage");
	core.on("getThreads", handleContentQuery, "storage");

	core.on("getNotes", handleNoteQuery, "storage");
};
