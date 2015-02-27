/* jshint browser: true */
/* global $ */

var formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	core.on("pref-show", function(conf, next) {
		var div = $("<div>");

		conf.user.params = conf.user.params || {};
		conf.user.params["domain-blacklist"] = conf.user.params["domain-blacklist"] || [];

		div.append(formField(
			"List of blacklisted domain", "area", "domain-blacklist", conf.user.params["domain-blacklist"].join("\n")
		));

		conf["blacklisted-domains"] = {
			html: div,
			text: "blacklisted domains"
		};

		next();
	}, 700);

	core.on("pref-save", function(user, next) {
		user.params = user.params || {};
		user.params["domain-blacklist"] = $("#domain-blacklist").val().split("\n");

		next();
	}, 500);
};
