"use strict";

var writeEntity = require("./actions/entity"),
	writeRelation = require("./actions/relation"),
	writeContent = require("./actions/content"),
//	writeNotification = require("./actions/notification"),
	
	readEntity = require("./queries/entity"),
	readContent = require("./queries/content"),
//	readNotification = require("./queries/notification"),
	
	resultTransforms = require("./result-transform"),
	
	pg = require("../lib/pg"),
	connString;

function handleEntityAction(action, next) {
	var sql = writeEntity(action); //.concat(writeNotification(action));
	pg.write(connString, sql, function (err) {
		next(err);
	});
}

function handleRelationAction(action, next) {
	var sql = writeRelation(action); //.concat(writeNotification(action));
	pg.write(connString, sql, function (err) {
		next(err);
	});
}

function handleContentAction(action, next) {
	var sql = writeContent(action); //.concat(writeNotification(action));
	
	pg.write(connString, sql, function (err) {
		next(err);
	});
}

function handleEntityQuery(query, next) {
	if(query.results) return next();
	
	var sql = readEntity(query);
	pg.read(connString, sql, function (err, results) {
		if(err) return next(err);
		query.results = resultTransforms[query.type](query, results);
		next();
	});
}

function handleContentQuery(query, next) {
	if(query.results) return next();
	
	var sql = readContent(query);
	pg.read(connString, sql, function (err, results) {
		if(err) return next(err);
		query.results = resultTransforms[query.type](query, results);
		next();
	});
}

//function handleNotificationQuery(query, next) {
//	var sql = readNotification(query);
//	pg.read(connString, sql, function (err, results) {
//		if(err) return next(err);
//		query.results = resultTransforms[query.type](query, [{rows: results}]);
//		next();
//	});
//}

module.exports = function (core, config) {
	connString = "pg://" + config.pg.username + ":" +
		config.pg.password + "@" + config.pg.server + "/" + config.pg.db;
	
	require('./timestamp.js')(core, config);
	// timestamp.js ensures that timestamps of texts and threads are unique in
	// a room (by incrementing by one or two milliseconds where they don't)
	// Assumes that no room has hundreds of messages a second.
	
	core.on("room", handleEntityAction, "storage");
	core.on("user", handleEntityAction, "storage");
	
	core.on("text", handleContentAction, "storage");
	core.on("edit", handleContentAction, "storage");
	
	core.on("join", handleRelationAction, "storage");
	core.on("part", handleRelationAction, "storage");
	core.on("admit", handleRelationAction, "storage");
	core.on("expel", handleRelationAction, "storage");
	
	core.on("getRooms", handleEntityQuery, "storage");
	core.on("getUsers", handleEntityQuery, "storage");
	core.on("getEntities", handleEntityQuery, "storage");
	
	core.on("getTexts", handleContentQuery, "storage");
	core.on("getThreads", handleContentQuery, "storage");
	
//	core.on("getNotifications", handleNotificationQuery, "storage");
};
