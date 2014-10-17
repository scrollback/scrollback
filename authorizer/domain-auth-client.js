/* global libsb, $ */
var formField = require("../lib/formField.js");
var handleAuthErrors = require('./handleAuthErrors.js');

libsb.on('config-show', function (conf, next) {
	if (!conf.room.guides) conf.room.guides = {};
	if (!conf.room.guides.allowedDomains) conf.room.guides.llowedDomains = [];

	var div = $('<div>').append(
		formField('List of allowed domains', 'area', "domain-list", conf.room.guides.allowedDomains.join("\n"))
	);

	conf.allowedDomains = {
		html: div,
		text: "domains",
		prio: 100
	};
	next();
}, 500);

libsb.on('config-save', function (room, next) {
	var domains = $('#domain-list').val();
	if (!room.guides) room.guides = {};
	room.guides.allowedDomains = domains.split("\n");
	next();
}, 500);

libsb.on('error-dn', function (error, next) {
	if (error.message === "ERR_NOT_ALLOWED") {
		handleAuthErrors(error);
	}
	next();
}, 1000);