var config = require("../config.js"),
	log = require("../lib/logger.js"),
	crypto = require('crypto'),
	request = require("request"), core,
	internalSession = Object.keys(config.whitelists)[0];

module.exports = function(c) {
	core = c;
	core.on("init", jws, "authentication");
};

function jws(action, callback) {
	var assertion;
	if(!action.auth || !action.auth.jws) return callback();
	
	core.emit("getUsers",{identity: action.auth.jws, session: internalSession}, function(err, user) {
		console.log(err, user);
		if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
		if(!user.results || user.results.length === 0) {
			action.user = {};
			action.user.identities = [identity];
			action.user.picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(action.auth.jws).digest('hex') + '/?d=retro';
			return callback();
		}
		action.old = action.user;
		if(action.old.id === action.user.id) {
			if(action.user.allowedDomains) {
				
			}
		}
		
		
		action.user.allowedDomains = [action.origin.domain];
		callback();
	});
}
