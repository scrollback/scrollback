/* jshint browser: true */

(function() {
    "use strict";

    var config = require(".././client-config-defaults.js"),
        core = new (require("ebus"))(config.appPriorities),
        state = require("./store/state-manager.js")(core, config),
        req;

    window.core = core;
    window.state = state;

    // jQuery library
    window.jQuery = window.$ = require("../bower_components/jquery/dist/jquery.min.js");

    // Third party libraries
    require("../bower_components/sockjs/sockjs.min.js");
    require("../bower_components/velocity/velocity.min.js");

	// UI widgets
	require('../bower_components/lace/src/js/jquery.alertbar.js');
	require('../bower_components/lace/src/js/jquery.modal.js');
	require('../bower_components/lace/src/js/jquery.multientry.js');
	require('../bower_components/lace/src/js/jquery.popover.js');
	require('../bower_components/lace/src/js/jquery.progressbar.js');

    // jQuery plugins
	require('../lib/jquery.setCursorEnd.js');
	require('../lib/jquery.isOnScreen.js');
	require('../lib/jquery.scrollToBottom.js');

    // Core
    require("./store/view-manager.js")(core, config, state);

    require("../dialogs/dialogs-client.js")(core, config, state);
    require("../dialogs/dialogs-listeners.js")(core, config, state);

    require("../calls-to-action/calls-to-action-client.js")(core, config, state);

    // Components
    require("./components/appbar-primary.jsx")(core, config, state);
    require("./components/appbar-secondary.jsx")(core, config, state);
    require("./components/chat.jsx")(core, config, state);
    require("./components/home-feed.jsx")(core, config, state);
    require("./components/people-list.jsx")(core, config, state);
    require("./components/profile-card.jsx")(core, config, state);
    require("./components/sidebar.jsx")(core, config, state);
    require("./components/thread-feed.jsx")(core, config, state);

    // Miscellaneous
	require('./misc/load-indicator.js')(core, config, state);
	require('./misc/appcache.js')(core, config, state);
	require('./misc/google-analytics.js')(core, config, state);
	require('./misc/workarounds.js')(core, config, state);

    // Send the initial setstate event
    req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		var data;

	    if (req.readyState === 4 ) {
	       if (req.status < 400 && req.responseText) {
				data = JSON.parse(req.responseText);

				core.emit("setstate", data);
	       }
	    }
	};

	req.open("GET", "/s/data.json", true);
	req.send();
}());
