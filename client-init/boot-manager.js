/* jshint browser: true */
/* global $*/
var parseURL = require("../lib/parseURL.js");

var queue = [];

function init(libsb) {
    ["init-up", "back-up"].forEach(function(event) {
        libsb.on(event, function(action, next) {
            if(libsb.hasBooted) return next();
            queue.push(next);
        }, 1000);
    });
    
    libsb.on("navigate", function(state, next) {
        if(state.source == "boot") return next();
        if(libsb.hasBooted) return next(new Error("BOOT_NOT_COMPLETE"));
        else next();
    }, 1000);
    
    $(function () {
        var state = parseURL(window.location.pathname, window.location.search);
        delete state.embed;
        state.source = "boot";
        libsb.emit("navigate", state, function () {
            libsb.hasBooted= true;
            processQueue();
        });
    });
}

module.exports = function (l) {
    init(l);
};

function processQueue() {
    while(queue.length) (queue.shift())();
}