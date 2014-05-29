		var formField = require("../lib/formField.js");

libsb.on('config-show', function(conf, next) {

	var div = $('<div>');
	div.append(formField("Block offensive words", "toggle", 'block-offensive'));
	div.append(formField("Blocked word lists", "checks", [
		['block-list-en', 'English'],
		['block-list-hi', 'Hindi']
	]));
	div.append(formField("Custom blocked words", "area", 'block-custom'));

	conf.spam = {
		html: div,
		text: "Spam control",
		prio: 600
	};

	next();
});

libsb.on('config-save', function(room, next){
	var lists = [];

	if( $('#block-list-en').is(':checked')) lists.push('en');
	if( $('#block-list-hi').is(':checked')) lists.push('hi');

	room.params["anti-abuse"] = {
		wordblock : $('#block-offensive').is(':checked'),
		block-lists: lists,
		customWords : $('#block-custom').val()
	};

	next();
});
