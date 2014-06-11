/* jslint browser: true */

var core = Object.create(require("./lib/emitter.js"));
window.validate = require('./lib/validate.js');
window.generate = require('./lib/generate');

// libsb files
require('./interface/interface-client')(core);
require('./localStorage/localStorage-client')(core);
require('./socket/socket-client')(core);
require('./id-generator/id-generator-client.js');

require('./public/s/js/array.contains.js');
require('./public/s/js/jquery.setCursorEnd.js');
require('./public/s/js/jquery.attrchange.js');
//require('./public/s/js/jquery.oembed.js');
require('./public/s/js/lace.js');
require('./public/s/js/desktopnotify.js');
require('./public/s/js/format.js');
require('./public/s/js/swipe-events.js');

// client uis
// require('./email/email-client.js');
require('./http/notifications-client.js');
require('./http/seo-client.js');
require('./http/roomGeneralSettings-client.js');
require('./http/userProfile-client.js');
require('./http/embed-client.js');
require('./irc/irc-client.js');
require('./anti-abuse/anti-abuse-client.js');
// require('./twitter/twitter-client.js');
// components
require('./public/s/components/load-indicator.js');
require('./public/s/components/embed-helper.js');
require('./public/s/components/appcache.js');
require('./public/s/components/infinite.js');
require('./public/s/components/hide-scroll.js');
require('./public/s/components/navigation.js');
require('./public/s/components/columns.js');
require('./public/s/components/chat.js');
require('./public/s/components/chat-item.js');
require('./public/s/components/chat-area.js');
require('./public/s/components/compose.js');
require('./public/s/components/browser-notify.js');
require('./public/s/components/panes.js');
require('./public/s/components/thread.js');
require('./public/s/components/thread-area.js');
require('./public/s/components/person.js');
require('./public/s/components/people-area.js');
require('./public/s/components/info-area.js');
require('./public/s/components/room-item.js');
require('./public/s/components/room-list.js');
require('./public/s/components/search.js');
require('./public/s/components/follow-room.js');
require('./public/s/components/facebook.js');
require('./public/s/components/settings-area.js');
require('./public/s/components/pref-area.js');
require('./public/s/components/user-area.js');
require('./public/s/components/noroom-area.js');
require('./public/s/components/signup-area.js');
require('./public/s/components/persona.js');
require('./public/s/components/URLparser.js')();
//require('./public/s/components/oembed-init.js');

//# sourceMappingURL=libsb.js.map
