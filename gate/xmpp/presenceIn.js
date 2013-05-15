var r = require("./router.js");

module.exports = function (stanza) {
	var user = stanza.from.split('/')[0],
		room = stanza.from.split('@')[0],
		listeners, i, l;
	if(!stanza.type) {
		if(room !== 'askabt') {
			addUserToRoom(user, room);
			listeners = core.rooms.getListeners(room);
			for(i=0, l=listeners.length; i<l; i++) {
				send();
			}
		}
		core.rooms.update
	} else switch(stanza.type) {
		case 'unavailable':
		case 'probe':
		case 'subscribe':
		case 'subscribed':
		case 'unsubscribed':
	}
};
