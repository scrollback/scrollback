/* global libsb, $ */
var formField = require("../lib/formField.js");

libsb.on("pref-show", function (conf, next) {
	var div = $("<div>");
	if (!conf.user.params) conf.user.params = {};
	if (!conf.user.params["domain-blacklist"]) conf.user.params["domain-blacklist"] = [];
	div.append(formField(
		"List of blacklisted domain", "area", "domain-blacklist", conf.user.params["domain-blacklist"].join("\n")
	));

	conf["blacklisted-domains"] = {
		html: div,
		text: "blacklisted domains",
		prio: 100
	};
	next();
}, 500);


libsb.on("pref-save", function (user, next) {
	if (!user.params) user.params = {};
	user.params["domain-blacklist"] = $("#domain-blacklist").val().split("\n");
	next();
}, 500);