var xmpp = require("node-xmpp"),
	config = require("./config.js"),
	r = new xmpp.Router(),
	handlers = {};

r.register(config.xmpp.host, function(stanza) {
	var from = stanza.attrs.from.split("/"), to = stanza.attrs.to.split("@");
	stanza.address = from[0];
	stanza.resource = from[1];
	stanza.topicId = to[0];
	stanza.discussionId = to[1]? to[1].split("/")[1]: "";
});

process.on('exit', function() {
	r.unregister(host);
});

r.on = function(ev, fn) {
	if(!handlers[ev]) handlers[ev] = [];
	handlers[ev].push(fn);
}

r.error = function (stanza, error) {
	if(stanza.type == 'error') return false;
	
	var err = [stanza.name, {
		from: stanza.to, to: stanza.from, type: 'error'
	}, ['error', { type: error.type }, error.condition ]];
	if(stanza.id) err[1].id = stanza.id;
	return err;
}

r.sanitize = function () {
	
}

module.exports = r;