/* eslint-env browser */

"use strict";

let config = require("../client-config-defaults.js"),
	core, store;

// jQuery library
window.jQuery = window.$ = require("../bower_components/jquery/dist/jquery.min.js");

// Polyfills
require("../lib/css-supports.polyfill.js");
require("../lib/custom-events.polyfill.js");
require("../lib/notification.polyfill.js");
require("../lib/request-animation-frame.polyfill.js");

// Third party libraries
require("../bower_components/sockjs/sockjs.js");

// UI widgets
require("../bower_components/lace/src/js/jquery.alertbar.js");
require("../bower_components/lace/src/js/jquery.modal.js");
require("../bower_components/lace/src/js/jquery.multientry.js");
require("../bower_components/lace/src/js/jquery.popover.js");

// jQuery plugins
require("./plugins/jquery.validInput.js");

// Core
window.core = core = new (require("ebus"))(config.appPriorities);
window.store = store = require("./../store/store.js")(core, config);

let args = [ core, config, store ];

// Trunks
require("../widget/widget-client.js")(...args);
require("../history/history-client.js")(...args);

// Apps
require("../notification/notification-client.js")(...args);
require("../anti-abuse/anti-abuse-client.js")(...args);
require("../authorizer/authorizer-client.js")(...args);
require("../authorizer/requests.js")(...args);
// require("../authorizer/invites.js")(...args);
require("../email/email-client.js")(...args);
require("../http/notifications-client.js")(...args);
require("../http/room-general-settings-client.js")(...args);
require("../http/seo-client.js")(...args);
require("../http/user-profile-settings-client.js")(...args);
require("../irc/irc-client.js")(...args);
require("../threader/threader-client.js")(...args);
require("../twitter/twitter-client.js")(...args);
require("../customization/customization-client.js")(...args);
require("../authorizer/error-handlers.js")(...args);

// User menu providers
require("../browserid-auth/browserid-auth-client.js")(...args);
require("../facebook/facebook-client.js")(...args);
require("../github/github-client.js")(...args);
require("../google/google-client.js")(...args);
require("../push-notification/gcm-client.js")(...args);
require("../http/logout-client.js")(...args);

// Modules
require("./modules/menu-listeners.js")(...args);
require("./modules/dialogs-listeners.js")(...args);
require("./modules/settings-room.js")(...args);
require("./modules/settings-user.js")(...args);
require("./modules/view-manager.js")(...args);
require("./modules/swipes.js")(...args);
require("./modules/ui-handle-errors.js")(...args);
require("../store/init-user-up-manager.js")(...args);
require("../store/add-user-timezone.js")(...args);

// Render the client
require("./components/client.js")(...args);

// Miscellaneous
require("./misc/fontloader.js")(...args);
require("./misc/appcache.js")(...args);
require("./misc/google-analytics.js")(...args);
require("./misc/load-indicator.js")(...args);
require("./misc/workarounds.js")(...args);

// Initialize
require("../init/init.js")(...args);
