/* jshint browser: true */

(function() {
	"use strict";

	var config  = require(".././client-config-defaults.js"),
		core, store;

	// jQuery library
	window.jQuery = window.$ = require("../bower_components/jquery/dist/jquery.min.js");

	// Polyfills
	require("../lib/css-supports.polyfill.js");
	require("../lib/custom-events.polyfill.js");
	require("../lib/request-animation-frame.polyfill.js");

	// Third party libraries
	require("../bower_components/sockjs/sockjs.js");

	// UI widgets
	require("../bower_components/lace/src/js/jquery.alertbar.js");
	require("../bower_components/lace/src/js/jquery.modal.js");
	require("../bower_components/lace/src/js/jquery.multientry.js");
	require("../bower_components/lace/src/js/jquery.popover.js");
	require("../bower_components/lace/src/js/jquery.progressbar.js");

	// jQuery plugins
	require("./plugins/jquery.validInput.js");

	// Core
	window.core = core = new (require("ebus"))(config.appPriorities);
	window.store = store = require("./../store/store.js")(core, config);

	// Trunks
	require("../widget/widget-bridge.js")(core, config, store);
	require("../history/history-client.js")(core, config, store);

	// Apps
	require("../anti-abuse/anti-abuse-client.js")(core, config, store);
	require("../authorizer/authorizer-client.js")(core, config, store);
	require("../email/email-client.js")(core, config, store);
	require("../embed/embed-config-client.js")(core, config, store);
	require("../http/notifications-client.js")(core, config, store);
	require("../http/room-general-settings-client.js")(core, config, store);
	require("../http/seo-client.js")(core, config, store);
	require("../http/user-profile-settings-client.js")(core, config, store);
	require("../irc/irc-client.js")(core, config, store);
	require("../threader/threader-client.js")(core, config, store);
	require("../twitter/twitter-client.js")(core, config, store);
	require('../customization/customization-client.js')(core, config, store);

	// User menu providers
	require("../browserid-auth/browserid-auth-client.js")(core, config, store);
	require("../facebook/facebook-client.js")(core, config, store);
	require("../github/github-client.js")(core, config, store);
	require("../google/google-client.js")(core, config, store);
	require("../push-notification/gcm-client.js")(core, config, store);
	require("../http/logout-client.js")(core, config, store);

	// Modules
	require("./modules/menu-listeners.js")(core, config, store);
	require("./modules/dialogs-listeners.js")(core, config, store);
	require("./modules/thread-dialog.js")(core, config, store);
	require("./modules/notifications.js")(core, config, store);
	require("./modules/settings-room.js")(core, config, store);
	require("./modules/settings-user.js")(core, config, store);
	require("./modules/signin-handler.js")(core, config, store);
	require("./modules/view-manager.js")(core, config, store);
	require("./modules/swipes.js")(core, config, store);

	// Render the client
	require("./components/client.jsx")(core, config, store);

	// Miscellaneous
	require("./misc/fontloader.js")(core, config, store);
	require("./misc/appcache.js")(core, config, store);
	require("./misc/google-analytics.js")(core, config, store);
	require("./misc/load-indicator.js")(core, config, store);
	require("./misc/workarounds.js")(core, config, store);

	// Initialize
	require("../init/init.js")(core, config, store);
}());
