/*
	XMPP Gateway
	
	Uses node-sync or node-fibers instead of and-then.
*/
var core = require("./core/core.js"),
	config = require("./config.js"),
	r = require("./router.js");
	
require('./invite.js').start();

exports.post = require("./postOut.js");
r.on('message', require('./messageIn.js'));
r.on('presence', require('./presenceIn.js'));
r.on('iq', require('./iqIn.js'));

