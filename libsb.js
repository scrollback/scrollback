var core = Object.create(require("./lib/emitter.js"));
window.generate = require('./lib/generate');

// libsb files
require('./interface/interface-client')(core);
require('./localStorage/localStorage-client')(core);
require('./socket/socket-client')(core);

require('./public/s/js/lace.js');
require('./public/s/js/format.js');
require('./public/s/js/swipe-events.js');

// client uis
require('./email/email-client.js');
require('./http/notifications-client.js');
require('./http/seo-client.js');
require('./http/roomGeneralSettings-client.js');
require('./http/userProfile-client.js');
require('./http/embed-client.js');
require('./irc/irc-client.js');
require('./anti-abuse/anti-abuse-client.js');

// components
require('./public/s/components/embed-helper.js');
require('./public/s/components/appcache.js');
require('./public/s/components/infinite.js');
require('./public/s/components/hide-scroll.js');
require('./public/s/components/navigation.js');
require('./public/s/components/columns.js');
require('./public/s/components/text.js');
require('./public/s/components/text-area.js');
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
require('./public/s/components/signup-area.js');
require('./public/s/components/persona.js');

//# sourceMappingURL=libsb.js.map
