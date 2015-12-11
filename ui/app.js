/* eslint-env browser */

"use strict";

let config = require("../client-config-defaults"),
	core, store;

// jQuery library
window.jQuery = window.$ = require("jquery");

// Polyfills
require("../lib/css-supports.polyfill");
require("../lib/custom-events.polyfill");
require("../lib/notification.polyfill");
require("../lib/request-animation-frame.polyfill");

// UI widgets
require("lace/src/js/jquery.alertbar");
require("lace/src/js/jquery.modal");
require("lace/src/js/jquery.multientry");
require("lace/src/js/jquery.popover");

// jQuery plugins
require("./plugins/jquery.validInput");

// Core
window.core = core = new (require("ebus"))(config.appPriorities);
window.store = store = require("./../store/store")(core, config);

let args = [ core, config, store ];

// Trunks
require("../widget/widget-client")(...args);
require("../history/history-client")(...args);

// Apps
require("../notification/notification-client")(...args);
require("../anti-abuse/anti-abuse-client")(...args);
require("../authorizer/authorizer-client")(...args);
require("../authorizer/requests")(...args);
// require("../authorizer/invites")(...args);
require("../email/email-client")(...args);
require("../http/notifications-client")(...args);
require("../http/room-general-settings-client")(...args);
require("../http/seo-client")(...args);
require("../http/user-profile-settings-client")(...args);
require("../irc/irc-client")(...args);
require("../threader/threader-client")(...args);
require("../customization/customization-client")(...args);
require("../authorizer/error-handlers")(...args);

// User menu providers
require("../browserid-auth/browserid-auth-client")(...args);
require("../facebook/facebook-client")(...args);
require("../github/github-client")(...args);
require("../google/google-client")(...args);
require("../push-notification/gcm-client")(...args);
require("../http/logout-client")(...args);

// Modules
require("./modules/menu-listeners")(...args);
require("./modules/dialogs-listeners")(...args);
require("./modules/settings-room")(...args);
require("./modules/settings-user")(...args);
require("./modules/view-manager")(...args);
require("./modules/swipes")(...args);
require("./modules/ui-handle-errors")(...args);
require("../store/init-user-up-manager")(...args);
require("../store/add-user-timezone")(...args);

// Render the client
require("./components/client")(...args);

// Miscellaneous
require("./misc/fontloader")(...args);
require("./misc/appcache")(...args);
require("./misc/google-analytics")(...args);
require("./misc/load-indicator")(...args);
require("./misc/workarounds")(...args);

// Initialize
require("../init/init")(...args);
