/* jshint browser: true */

(function() {
	"use strict";
	require("../bower_components/sockjs/sockjs.js");
	var config = require(".././client-config-defaults.js"),
		core = new (require("ebus"))(config.appPriorities),
		store = require("./../store/store.js")(core, config);

	window.core = core;
	window.store = store;

	// jQuery library
	window.jQuery = window.$ = require("../bower_components/jquery/dist/jquery.min.js");

	// Third party libraries
	
	require("../bower_components/velocity/velocity.min.js");

	// UI widgets
	require("../bower_components/lace/src/js/jquery.alertbar.js");
	require("../bower_components/lace/src/js/jquery.modal.js");
	require("../bower_components/lace/src/js/jquery.multientry.js");
	require("../bower_components/lace/src/js/jquery.popover.js");
	require("../bower_components/lace/src/js/jquery.progressbar.js");

	// jQuery plugins
	require("./plugins/jquery.setCursorEnd.js");
	require("./plugins/jquery.isOnScreen.js");
	require("./plugins/jquery.scrollToBottom.js");
	require("./plugins/jquery.validInput.js");

	// Core
	require("./store/view-manager.js")(core, config, store);

	// Apps
	require("../http/room-general-settings-client.js")(core, config, store);
	require("../http/user-profile-settings-client.js")(core, config, store);
	require("../anti-abuse/anti-abuse-client.js")(core, config, store);
	require("../authorizer/authorizer-client.js")(core, config, store);
	require("../email/email-client.js")(core, config, store);
	require("../embed/embed-client.js")(core, config, store);
	require("../http/notifications-client.js")(core, config, store);
	require("../http/seo-client.js")(core, config, store);
	require("../irc/irc-client.js")(core, config, store);
	require("../threader/threader-client.js")(core, config, store);
	require("../twitter/twitter-client.js")(core, config, store);

	// User menu providers
	require("../http/logout-client.js")(core, config, store);
	require("../facebook/facebook-client.js")(core, config, store);
	require("../google/google-client.js")(core, config, store);
	require("../github/github-client.js")(core, config, store);
	require("../browserid-auth/browserid-auth-client.js")(core, config, store);

	// Modules
	require("./modules/dialogs-listeners.js")(core, config, store);
	require("./modules/settings-room.js")(core, config, store);
	require("./modules/settings-user.js")(core, config, store);

	// Render the client
	require("./components/client.jsx")(core, config, store);

	// Miscellaneous
	require("./misc/load-indicator.js")(core, config, store);
	require("./misc/appcache.js")(core, config, store);
	require("./misc/google-analytics.js")(core, config, store);
	require("./misc/workarounds.js")(core, config, store);

}());
