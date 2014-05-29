/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");

libsb.on('config-show', function(tabs, next) {
    var results = tabs.room; 
    var div = $('<div>').addClass('list-view list-view-spam-settings');
    div.append(formField("Block offensive words", "toggle", 'block-offensive', results.params.antiAbuse.offensive));
    tabs.spam = {
        html: div,
        text: "Spam control",
        prio: 600
    };
    next();
});

libsb.on('config-save', function(room, next){
    room.params.antiAbuse = {
        offensive : $('#block-offensive').is(':checked')
    };
    next();
});
