var config = require("../../config.js"),
	name = require("../../lib/names.js"),
	request = require("request");

module.exports = function(core) {
	core.on('message', function(message, callback) {
		var assertion = message.browserid;
		delete message.browserid;
		
		if(message.type !== 'nick') return callback();
		if (message.origin && message.origin.gateway=="irc") return callback();
		
		if (message.ref == 'guest-') {
			message.ref += "sb-"+name(6);
			return callback();
		}
		
		if (!assertion && message.user) {
			if (!validateNick(message.user.id)) {
				message.user.id = message.user.originalId;
				return callback(new Error("INVALID_NICK"));
			}
			return core.room(message.user.id,function(err,room) {
				if (err) return callback(err);
				if (room.length && message.user.originalId != message.user.id) {
					message.user.id = message.user.originalId;
					return callback(new Error("DUP_NICK"));
				} else {
					
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
			audience: 'https://'+config.http.host+":"+config.http.https.port
		}}, function(err, res, body) {
			var account;
			if(err) return callback(new Error("AUTH_FAIL_NETWORK/" + err.message));
			try {
				body = JSON.parse(body);
			} catch(e) {
				return callback(new Error("AUTH_FAIL_SERVER/" + body));
			}
			if(body.status !== 'okay') {
				return callback(new Error("AUTH_FAIL/" + body.reason));
			}
			account ={
				id: "mailto:" + body.email,
				gateway: "mailto",
				params: ""
			};
			console.log(account);

			core.rooms({accounts: [account]}, function(err, data) {
				if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
				if(data.length === 0) {
					message.user = {accounts: [account]};
					return callback(new Error("AUTH_UNREGISTERED"));
				}
				message.user = data[0];
				message.user.accounts=[account];
				message.ref = data[0].id;
				return callback();
			});
		});
	});
};

function validateNick(nick){
	if (nick.indexOf("guest-")==0) return false;
	return (nick.match(/^[a-z][a-z0-9\_\-\(\)]{4,32}$/i)?true:false);
}