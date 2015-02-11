/* jshint browser: true */

(function() {
    "use strict";

    var config = require(".././client-config-defaults.js"),
        data = require("./store/data.json"),
        core = new (require("ebus"))(config.appPriorities),
        state = require("./store/state-manager.js")(core, config);

    window.core = core;
    window.state = state;

    // third party libraries
    require("../public/s/scripts/lib/sockjs.min.js");
    require("../public/s/scripts/lib/velocity.min.js");

    // core
    require("./store/view-manager.js")(core, config, state);

    // components
    // require("./components/discussions.js")(core);
    require("./components/chat.js")(core, config, state);

    // JSX components
    require("./jsx/appbar-primary.jsx")(core, config, state);
    require("./jsx/appbar-secondary.jsx")(core, config, state);
    require("./jsx/sidebar.jsx")(core, config, state);
    require("./jsx/profile-card.jsx")(core, config, state);
    require("./jsx/home-feed.jsx")(core, config, state);
    require("./jsx/people-list.jsx")(core, config, state);

    // send the initial setstate event
    core.emit("setstate", data);
}());

