var config = require("../config.js"),
	name = require("../lib/names.js"),
	log = require("../lib/logger.js"),
	request = require("request");

module.exports = function(core) {
	core.on('message', function(message, callback) {
		var assertion = message.browserid;
		log("Heard \"message\" event");
		delete message.browserid;

		if(message.type !== 'nick') return callback();

		if (message.origin && message.origin.gateway=="irc") return callback();

		if (message.ref == 'guest-') {
			message.ref += "sb-"+name(6);
			return callback();
		}

		if (!assertion && message.user) {
			//message.ref = message.user.id;
			if (!validateNick(message.user.id)) {
				message.user.id = message.user.originalId;
				return callback(new Error("INVALID_NICK"));
			}
			return core.emit("rooms", {id: message.user.id}, function(err,room) {
				if (err) return callback(err);
				if (room.length>0 && room[0].id && message.user.originalId != message.user.id) {
					message.user.id = message.user.originalId;
					return callback(new Error("DUP_NICK"));
				} else {
					message.user.type = "user";
					return core.emit("room", message.user, function(err,room) {
						if (callback) {
							message.ref = room.id;
							callback(null,message);
						}
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
			audience: config.auth.audience
		}}, function(err, res, body) {
			var account;
			if(err) return callback(new Error("AUTH_FAIL_NETWORK " + err.message));
			try {
				body = JSON.parse(body);
			} catch(e) {
				return callback(new Error("AUTH_FAIL_SERVER " + body));
			}
			if(body.status !== 'okay') {
				return callback(new Error("AUTH_FAIL " + body.reason));
			}
			account ={
				id: "mailto:" + body.email,
				gateway: "mailto",
				params: ""
			};
			core.emit("rooms",{accounts: [account]}, function(err, data) {
				if(err) return callback(new Error("AUTH_FAIL_DATABASE/" + err.message));
				if(data.length === 0) {
					message.user = {accounts: [account]};
					return callback(new Error("AUTH_UNREGISTERED"), message);
				}
				message.user = data[0];
				message.user.accounts=[account];
				message.ref = data[0].id;
				return callback();
			});
		});
	}, "authentication");
};

function validateNick(nick){
	if (nick.indexOf("guest-")==0) return false;
	return (nick.match(/^[a-z][a-z0-9\_\-\(\)]{2,32}$/i)?nick!='img'&&nick!='css'&&nick!='sdk':false);
}
