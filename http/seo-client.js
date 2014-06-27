/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");

libsb.on('config-show', function (tabs, next) {
    var results = tabs.room;

    if (!results.params.http) {
        results.params.http = { seo: true };
    }

    var $div = $('<div>').append(formField("Allow search engines to index room", "toggle", "allow-index", results.params.http.seo));

    tabs.seo = {
        text: "Search visibility",
        html: $div,
        prio: 500
    };

    next();
}, 500);

libsb.on('config-save', function (room, next) {
    if (!room.params.http) room.params.http = {};
    room.params.http.seo = $('#allow-index').is(':checked');
    next();
}, 500);
