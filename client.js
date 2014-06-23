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

require('./public/s/js/jquery.setCursorEnd.js');
require('./public/s/js/jquery.attrchange.js');
require('./public/s/js/format.js');
require('./public/s/js/swipe-events.js');

// client uis
require('./email/email-client.js');
require('./http/notifications-client.js');
require('./authorizer/authorizer-client.js');
require('./http/seo-client.js');
require('./http/roomGeneralSettings-client.js');
require('./http/userProfile-client.js');
require('./embed/embed-client.js');
require('./irc/irc-client.js');
require('./anti-abuse/anti-abuse-client.js');
require('./twitter/twitter-client.js');
//require('./customization/customization-client.js');

// components
require('./ui/quicknotify.js');
require('./ui/load-indicator.js');
require('./ui/embed-helper.js');
require('./ui/appcache.js');
require('./ui/customization.js');
require('./ui/infinite.js');
require('./ui/hide-scroll.js');
require('./ui/navigation.js');
require('./ui/columns.js');
require('./ui/chat.js');
require('./ui/chat-item.js');
require('./ui/chat-area.js');
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
require('./ui/URLparser.js')();

//# sourceMappingURL=libsb.js.map
