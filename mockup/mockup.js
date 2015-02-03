/* jshint browser: true */
/* global core */

(function() {
    "use strict";

    var config = require(".././client-config-defaults.js"),
        data = require("./store/data.json");

    window.core = new (require("ebus"))(config.appPriorities);

    window.currentState = data; // FIXME: should set to empty schema

    // third party libraries
    require(".././public/s/scripts/lib/sockjs.min.js");
    require(".././public/s/scripts/lib/velocity.min.js");

    // core
    require("./store/state-manager.js");

    // components
    require("./components/roomlist.js");
    require("./components/user.js");
    require("./components/people.js");
    require("./components/discussions.js");
    require("./components/chat.js");
    require("./components/sidebar.js");

    // send the initial setstate event
    core.emit("setstate", data, function() {
        window.currentState = data;
    });
}());
