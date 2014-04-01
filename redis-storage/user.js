var config = require("../config.js");
var getSession = require("./getSession.js");

module.exports = function(core) {
	core.on("user", function(action, callback) {
		userDB.put("user:{{"+action.user.id+"}}", JSON.stringify(action.user));
		callback();
	}, "storage");


	core.on("init", function(action, callback) {
		userDB.get("user:{{"+action.old.id+"}}", function(){

		});
		sessionDB.del();

		getSession(action.session, function(sessionObj) {

			callback();
		});
	},"storage");
});
