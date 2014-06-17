var core;
var config = require('../config.js');
var log  = require('../lib/logger.js');
var crypto = require('crypto');
var internalSession = Object.keys(config.whitelists)[0];
var core, events = ['text', 'edit', 'admit', 'expel',
							'room', 'getRooms', "getUsers", "getTexts", "getThreads"];
var su = config.su;
var queries = ['getRooms', "getUsers", "getTexts", "getThreads"];
module.exports = function(c) {
	
	core = c;
	events.forEach(function(event) {
		core.on(event, queriesAndAction, "sudo");
	});
	core.on("user", function(action, cb) {
		log("user events****", JSON.stringify(action));
		if (su[action.from]) {
			core.emit("getUsers", {ref: action.user.id, session: internalSession}, function(err, data) {
				if(err || !data || !data.results || !data.results.length) {
					action.old = {};
				}else {
					action.old = data.results[0];
				}
				if(action.user.identities) action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(action.user.identities[0]).digest('hex');
				else action.user.picture = 'https://gravatar.com/avatar/default';
				action.user.description = action.user.description || "";
				action.role = "su";
				log("action :****", JSON.stringify(action));
				cb();
			});
		} else cb();
	}, "sudo");
};

function queriesAndAction(aq, callback) {
	log("****: ", aq);
	if (aq.user && su[aq.user.id]) {
		aq.user.role = 'su';
	}
	callback();
}


