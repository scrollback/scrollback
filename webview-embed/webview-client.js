/* jshint node:true, browser:true */
/* global libsb, currentState */

var changedNick = false;

libsb.on("navigate", function(state, next) {
    if (!changedNick && state.hasOwnProperty('webview') && currentState.connectionStatus === "online") {
        try {
            var webview = JSON.parse(decodeURIComponent(state.webview));
            if (webview.hasOwnProperty('nick')) {
                libsb.emit('init-up', {
                    suggestedNick: webview.nick
                }, function() {
                    changedNick = true;
                });
            }
        } catch(e) {
            // silently discard parse error
        }
    }
    next();
}, 600);