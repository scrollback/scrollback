/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");

libsb.on('config-show', function(tabs, next) {
    var results = tabs.room;
    var div = $('<div>').addClass('list-view list-view-seo-settings');

	if (!results.params.http) {
		results.params.http = { seo: true };
	}

    div.append(formField("Allow search engines to index room", "toggle", "allow-index", results.params.http.seo));
    tabs.seo = {
            html: div,
            text: "Search engine indexing",
            prio: 500
    }
    next();
});

libsb.on('config-save', function(room, next){
       if(!room.params.http) room.params.http = {};
       room.params.http.seo = $('#allow-index').is(':checked');
       next();
});
