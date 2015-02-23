var core;
var core, events = ['text', 'edit', 'admit', 'expel',
							'room', 'getRooms', "getUsers", "getTexts", "getThreads"];
var su;
module.exports = function(c, config) {
	su = config.global.su || {};
	core = c;
	events.forEach(function(event) {
		core.on(event, queriesAndAction, "sudo");
	});
	core.on("user", function(action, cb) {
		if (su[action.from]) {
			core.emit("getUsers", {ref: action.user.id, session: "internal-superuser"}, function(err, data) {
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
	if (aq.user && su[aq.user.id]) {
		aq.user.role = 'su';
	}
	callback();
}


