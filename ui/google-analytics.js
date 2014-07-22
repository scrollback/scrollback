/* jshint browser: true */
/* global _gaq, libsb */

(function() {
    // Track navigation events
    var props = ["roomName", "thread", "mode", "tab", "query"];

    libsb.on("navigate", function(state, next) {
        if (!(state.old && _gaq)) { return next(); }

        props.forEach(function(prop) {
            if (state.old[prop] !== state[prop]) {
                _gaq.push(["_trackEvent", prop, state[prop]]);
            }
        });

        next();
    }, 500);
})();
