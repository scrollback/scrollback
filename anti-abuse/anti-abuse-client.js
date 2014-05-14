var formField = require("../lib/formField.js");
libsb.on('config-show', function(conf, next) {
	// conf.spam = "<div class='pane pane-spam-settings'>" + formField("Block repetitive messages", "toggle", "block-repetitive") + formField("Block nonsense messages", "toggle", "block-nonsense") + formField("Bloack offesnive words", "checks", [ [ "en-moderate", "English moderate" ], [ "en-strict", "English strict" ], [ "zh-strict", "Chinese strict" ] ]) + formField("Custom blocked word", "segmented", "blocked-words" ) + formField("Gaggded users", "segmented", "gagged-users" ) + formField("Banned users", "segmented", "banned-users" ) + "</div>";
	conf.spam = {
		html: "<div class='pane pane-spam-settings'>" + formField("Block offensive words", "toggle", 'block-offensive'),
		text: "Spam control",
		prio: 600
	}

	next();
});
libsb.on('config-save', function(conf, next){
	conf.spam = {
		offensive : $('#block-offensive').is(':checked')
	};

	next();
});