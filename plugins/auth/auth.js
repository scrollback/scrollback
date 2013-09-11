var config = require("../../config.js"),
	request = require("request");

module.exports = function(core) {
	core.on('message', function(message, callback) {
		var assertion = message.browserid;
		delete message.browserid;
		
		if(message.type !== 'nick') return callback();
		
		if (!assertion && message.user) {
			core.room(message.user.id,function(err,room) {
				if (room.length!=0 && message.user.originalId!=message.user.id) {
					return callback(new Error("DUP_NICK/ Nick already exist."));
				}else{
					return core.room(message.user,function(err,room) {
						if (callback) {
							callback(err,message);	
						}
						return;
					});	
				}
			});
			
		}
		
		if(!assertion) {
			// If there is no authentication info, make sure the new nick is a guest.
			if(!/^guest-/.test(message.ref)) message.ref = 'guest-' + message.ref;
			return callback();
		}
		
		request.post("https://verifier.login.persona.org/verify", { form: {
			assertion: assertion,
			audience: 'http://'+config.http.host+":"+config.http.port
		}}, function(err, res, body) {
			var accountId;
			if(err) return callback(new Error("AUTH_FAIL_NETWORK/" + err.message));
			try {
				body = JSON.parse(body);
			} catch(e) {
				return callback(new Error("AUTH_FAIL_SERVER/" + body));
			}
			if(body.status !== 'okay') {
				return callback(new Error("AUTH_FAIL/" + body.reason));
			}
			accountId = "mailto:" + body.email;
			core.rooms({accounts: [accountId]}, function(err, data) {
				if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
				if(data.length === 0) {
					message.user = {accounts: [accountId]};
					return callback(new Error("AUTH_UNREGISTERED"));
				}
				message.user = data[0];
				message.user.accounts=[accountId];
				message.ref = data[0].id;
				return callback();
			});
		});
	});
};