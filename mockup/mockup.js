/* jshint browser: true */

(function() {
    "use strict";

    var config = require(".././client-config-defaults.js"),
        data = require("./store/data.json"),
        core = new (require("ebus"))(config.appPriorities);

    window.core = core;

    // third party libraries
    require("../public/s/scripts/lib/sockjs.min.js");
    require("../public/s/scripts/lib/velocity.min.js");

    // core
    require("./store/state-manager.js")(core);
    require("./store/view-manager.js")(core);

    // components
    require("./components/people.js")(core);
    require("./components/discussions.js")(core);
    require("./components/chat.js")(core);

    // JSX components
    require("./jsx/sidebar.jsx")(core);
    require("./jsx/profile-card.jsx")(core);
    require("./jsx/homefeed.jsx")(core);

    // send the initial setstate event
    core.emit("setstate", data);
}());

