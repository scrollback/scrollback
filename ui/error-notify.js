/* jshint browser: true */
/* global $, libsb */

$(function() {
    var lace = require("../lib/lace.js"),
        errmsg;

    libsb.on("error-dn", function(err, next) {

        switch(err.message) {
            case "ERR_IRC_NOT_CONNECTED":
                errmsg = "We are having some issues with irc. Please try again after some time";
                break;
        }

        if (errmsg) {
            lace.alert.show({ type: "error", body: errmsg });
        }

        next();
    });
});
