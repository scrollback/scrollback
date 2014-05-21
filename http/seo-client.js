var formField = require("../lib/formField.js");

var div = $('<div>').addClass('list-view list-view-seo-settings');
div.append(formField("Allow search engines to index room", "toggle", "allow-index"));

libsb.on('config-show', function(conf, next) {
	conf.seo = {
		html: div,
		text: "Search engine indexing",
		prio: 500
	}
	next();
});