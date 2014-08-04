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
        if (!libsb.hasBooted) {
            // add more sources if the navigate has to be queued up.
            if (["socket"].indexOf(state.source) >= 0) return actionQueue.enQueue(next);
			console.log("Throwing not booted error",state);
            return next(new Error("BOOT_NOT_COMPLETE"));
        }
        next();
    }, 1000);
}

module.exports = function (l) {
    init(l);
};