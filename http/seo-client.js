libsb.on('config-show', function(conf, next) {
	conf.seo = {
		html: "<div class='pane pane-seo-settings'>" + formField("Allow search engines to index room", "toggle", "allow-index") + "</div>",
		text: "Search engine indexing", 
		prio: 500
	}

	next();
});
libsb.on('config-save', function(conf, next){
	conf.seo = $('.pane-seo-settings #allow-index').is(':checked');

	next();
});