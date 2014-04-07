var names = [
	"init", "back", "away", "text", ...,
	"getTexts", "getThreads", "getUsers", "getSessions", "getRooms"
], handlers = {}, core;

function api(c) {
	core = c;
	apiList.forEach(function(name) { handlers[name] = require("./api/" + name + ".js")(core); });
}

api.process = function(action, cb) {
	handler[action.type](action, cb);
}

module.exports = api;

