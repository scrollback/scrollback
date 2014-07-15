/* jslint browser: true */

var core = Object.create(require("./lib/emitter.js"));

window.validate = require('./lib/validate.js');
window.generate = require('./lib/generate');

// libsb files
require('./interface/interface-client')(core);
require('./localStorage/localStorage-client')(core);
require('./socket/socket-client')(core);

require('./id-generator/id-generator-client.js')();
require('./client-entityloader/client-entityloader.js')();

require('./lib/jquery.setCursorEnd.js');
require('./lib/jquery.attrchange.js');
require('./lib/jquery.velocity.min.js');
require('./lib/format.js');
require('./lib/swipe-events.js');

// client uis
require('./email/email-client.js');
require('./http/notifications-client.js');
require('./authorizer/authorizer-client.js');
require('./http/seo-client.js');
require('./http/roomGeneralSettings-client.js');
require('./http/userProfile-client.js');
require('./embed/embed-client.js');
require('./embed/embed-helper.js');
require('./irc/irc-client.js');
require('./anti-abuse/anti-abuse-client.js');
require('./twitter/twitter-client.js');
require('./customization/customization-client.js');

// user menus
require('./http/logout-client.js');
require('./facebook/facebook-client.js');
require('./github/github-client.js');
require('./persona/persona-client.js');

// components
require('./ui/quicknotify.js');
require('./ui/load-indicator.js');
require('./ui/appcache.js');
require('./ui/infinite.js');
require('./ui/hide-scroll.js');
require('./ui/navigation.js');
require('./ui/error-notify.js');
require('./ui/columns.js');
require('./ui/chat.js');
require('./ui/chat-area.js');
require('./ui/chat-threads.js');
require('./ui/compose.js');
require('./ui/notify-ticker.js');
require('./ui/browser-notify.js');
require('./ui/panes.js');
require('./ui/thread.js');
require('./ui/thread-area.js');
require('./ui/person.js');
require('./ui/people-area.js');
require('./ui/info-area.js');
require('./ui/room-item.js');
require('./ui/room-list.js');
require('./ui/search.js');
require('./ui/follow-room.js');
require('./ui/facebook.js');
require('./ui/conf-area.js');
require('./ui/pref-area.js');
require('./ui/user-area.js');
require('./ui/noroom-area.js');
require('./ui/signup-area.js');
require('./ui/persona.js');
require('./ui/message-menu.js');
require('./ui/room-notifications.js');
require('./ui/URLparser.js')();
require('./ui/google-analytics.js');

//# sourceMappingURL=libsb.js.map
