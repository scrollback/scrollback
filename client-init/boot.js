/* jshint browser: true */
/* global $*/
var parseURL = require("../lib/parseURL.js");
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
    $(function () {
        console.log("dom ready/");
        var state = parseURL(window.location.pathname, window.location.search);
        delete state.embed;
        state.source = "boot";
        state.connectionStatus = false;
        console.log("Emiting the boot navigate");
        libsb.emit("navigate", state, function (err, state) {
            console.log("DONE", err, state);
            libsb.hasBooted = true;
            actionQueue.processAll();
        });
    });
}

module.exports = function (l) {
    init(l);
};