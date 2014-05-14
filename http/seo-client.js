var formField = require("../lib/formField.js");
libsb.on('config-show', function(conf, next) {
	conf.seo = {
		html: "<div class='pane pane-seo-settings'>" + formField("Allow search engines to index room", "toggle", "allow-index") + "</div>",
		text: "Search engine indexing", 
		prio: 500
	}

	next();
});