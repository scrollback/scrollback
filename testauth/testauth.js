var config = require("../config.js"),
	name = require("../lib/generate.js").word,
	log = require("../lib/logger.js"),
	request = require("request");
var SbError = require("../../lib/SbError.js");

module.exports = function(core) {
	core.on('init', function(action, callback) {
		if(!action.auth || !action.auth.testauth) return callback();
		var testauth = action.auth.testauth || "";
		if(action.type !== 'init' || !action.auth || !action.auth.testauth) return callback();
		delete action.auth.testauth;
		if(testauth == "user1:1234567890") {
			action.user = {
				id:"testUser1"
			}
			callback();
		}else if(testauth == "user2:0987654321") {
			action.user = {
				id:"testUser2"
			}
			callback();
		}else {
			callback(new SbError("AUTH_UNREGISTERED"));
		}
	}, "authentication");
};