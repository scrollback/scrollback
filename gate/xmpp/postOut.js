var r = require("./router.js"),
	c = require("./conference.js"),
	randomId = require("guid"),
	config = require("./config.js");

module.exports = function (post, users) {
	var i, l, text = r.sanitize(post.text), user;
	for(i=0, l = users.length; i<l; i++) {
		user = users[i];
		if(c.isUserInRoom(user.id, post.to)) {
			// Send room post.
			r.send(['message', {
				from: post.to + '@' + config.xmppHost + '/' + post.from,
				to: user.xmppId,
				type: 'groupchat',
				id: randomId()
			}, [body, post]]);
		}
		else if(!c.isUserInvited(user, room)) {
			// Send room invitation.
			r.send(['message', {
				from: config.xmppId,
				to: user.xmppId
			}, [x, {
				xmlns: 'jabber:x:conference',
				jid: post.to + '@' + config.xmppHost,
				reason: text
			}]]);
			c.addUserInvited(user, room);
		}
	}
}