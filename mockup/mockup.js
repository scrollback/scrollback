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
    var state = require("./../store/store.js")(core, config );
    require("./store/view-manager.js")(core, config, state);

    // components
    require("./components/people.js")(core, config, state);
    require("./components/discussions.js")(core, config, state);
    require("./components/chat.js")(core, config, state);

    // JSX components
    require("./jsx/sidebar.jsx")(core, config, state);
    require("./jsx/profile-card.jsx")(core, config, state);
    require("./jsx/home-feed.jsx")(core, config, state);

    // send the initial setstate event
    core.emit("setstate", data);
}());

