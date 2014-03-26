var config = require("../config.js"),
	name = require("../lib/generate.js").word,
	log = require("../lib/logger.js"),
	request = require("request");


actionLogger = function(){
	var action = arguments[0].splice(0,1);
	log(action.id, arguments)
}
module.exports = function(core) {
	core.on('init', function(action, callback) {
		var testauth = action.testauth || "";
		actionLogger(action, "heard init action");		
		if(action.type !== 'init') return callback();
		delete action.testauth;
		if(testauth == "user1:1234567890") {
			core.emit("getUsers", {id: "testuser1"}, function(err, users) {
				action.user = data[0];
				callback();
			});
		}else if(testauth == "user1:0987654321") {
			core.emit("getUsers", {id: "testuser2"}, function(err, users) {
				action.user = data[0];
				callback();
			});
		}else {
			callback(new Error("AUTH_UNREGISTERED"));
		}
	}, "authentication");
};