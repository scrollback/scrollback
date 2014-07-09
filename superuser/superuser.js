var core;
var config = require('../config.js');
var internalSession = Object.keys(config.whitelists)[0];
var core, events = ['text', 'edit', 'admit', 'expel',
							'room', 'getRooms', "getUsers", "getTexts", "getThreads"];
var su = config.su;
module.exports = function(c) {
	
	core = c;
	events.forEach(function(event) {
		core.on(event, queriesAndAction, "sudo");
	});
	core.on("user", function(action, cb) {
//		log("user events****", JSON.stringify(action));
		if (su[action.from]) {
			core.emit("getUsers", {ref: action.user.id, session: internalSession}, function(err, data) {
				if(err || !data || !data.results || !data.results.length) {
					action.old = {};
				}else {
					action.old = data.results[0];
				}
				action.role = "su";//it will be deleted in autherizer
				cb();
			});
		} else cb();
	}, "sudo");
};

function queriesAndAction(aq, callback) {
//	log("****: ", aq);
	if (aq.user && su[aq.user.id]) {
		aq.user.role = 'su';
	}
	callback();
}


