/* jshint browser: true */
var actionQueue = require("./actionQueue.js")();

function init(libsb) {
    ["init-up", "back-up"].forEach(function (event) {
        libsb.on(event, function (action, next) {
            if (libsb.hasBooted) return next();
            actionQueue.enQueue(next);
        }, 1000);
    });

    libsb.on("navigate", function (state, next) {
        if (state.source == "boot") return next();
        if (libsb.hasBooted) return next(new Error("BOOT_NOT_COMPLETE"));
        else next();
    }, 1000);
}

module.exports = function (l) {
    init(l);
};