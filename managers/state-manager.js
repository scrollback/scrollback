/* jshint browser: true */
/* global $, window*/
/* exported currentState */

var currentState = window.currentState = {}; // think of a way to remove this from window.(if need)
module.exports = function (libsb) {
    libsb.on("navigate", loadOld, 1000);
    libsb.on("navigate", saveCurrentState, 700);
};

function loadOld(state, next) {
    // load the "old" property and the "changes" property.
    state.old = $.extend(true, {}, currentState); // copying object by value
    state.changes = {};

    ["roomName", "room", "view", "theme", "embed", "minimize", "mode", "tab", "thread", "query", "text", "time"].forEach(function (prop) {
        if (typeof state[prop] === "undefined") {
            if (typeof state.old[prop] !== "undefined") {
                state[prop] = state.old[prop];
            }
            return;
        }
        if (state[prop] != state.old[prop]) {
            state.changes[prop] = state[prop];
        }
    });
    next();
}

function saveCurrentState(state, next) {
    ["roomName", "room", "view", "theme", "embed", "minimize", "mode", "tab", "thread", "query", "text", "time"].forEach(function (prop) {
        if (typeof state[prop] === "undefined") {
            if (typeof state.old[prop] !== "undefined") {
                currentState[prop] = state.old[prop];
            }
            return;
        }

        if (state[prop] === null) {
            delete currentState[prop];
        } else {
            currentState[prop] = state[prop];
        }
    });
    next();
}