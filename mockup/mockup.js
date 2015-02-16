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
    state = require("./../store/store.js")(core, config );
    window.state = state;
    require("./store/view-manager.js")(core, config, state);
    // components
    require("./components/appbar-primary.jsx")(core, config, state);
    require("./components/appbar-secondary.jsx")(core, config, state);
    require("./components/chat.jsx")(core, config, state);
    require("./components/home-feed.jsx")(core, config, state);
    require("./components/people-list.jsx")(core, config, state);
    require("./components/profile-card.jsx")(core, config, state);
    require("./components/sidebar.jsx")(core, config, state);
    require("./components/thread-feed.jsx")(core, config, state);
    // send the initial setstate event
    core.emit("setstate", data);
}());
