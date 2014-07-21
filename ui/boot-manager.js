/* jshint browser: true */
/* global $*/
var parseURL = require("../lib/parseURL.js");
module.exports = function (l) {
    init(l);
};

function init(libsb) {
    $(function () {
        var state = parseURL(window.location.pathname, window.location.search);
        delete state.embed;
        state.source = "boot";
        console.log("STATE:", state);
        libsb.emit("navigate", state, function () {
            libsb.hasBooted= true;
        });
    });
}