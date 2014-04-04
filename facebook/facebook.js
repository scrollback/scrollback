var config = require("../config.js"),
	name = require("../lib/names.js"),
	log = require("../lib/logger.js"),
	request = require("request");

module.exports = function(core) {
	core.on("http/init", function(payload, callback) {
		payload.facebook = {
			get: handlerRequest
		};
		callback(null, payload);
	}, "setters");
	core.on('message', function(message, callback) {
		if(message.type !== 'nick') return callback();
		if (message.origin && message.origin.gateway=="irc") return callback();
		if (message.ref == 'guest-') return callback();
		if(message.auth && message.auth.facebook) {
			request("https://graph.facebook.com/oauth/access_token?client_id="+config.facebook.client_id+
				"&redirect_uri=https://"+config.http.host+"/r/facebook/return"+
				"&client_secret="+config.facebook.client_secret+
				"&code="+message.auth.facebook.code,
				function(err, res, body) {
					if(err) return callback(err);
					var queries = body.split("&"), i,l, token;
					for(i=0,l=queries.length;i<l;i++){
						if(queries[i].indexOf("access_token")>=0){
							token = queries[i].replace("access_token=","");
							break;
						}
					}
					if(token) {
						request("https://graph.facebook.com/me?access_token=" + token, function(err, res, body) {
							var user;
							delete message.auth.facebook.code;
							if(err) return callback(err);
							try{
								user = JSON.parse(body);
								if(user.error){
									return callback(new Error(user.error))
								}
								core.emit("getUsers",{identity: "mailto:"+user.email}, function(err, data){
									if(err || !data) return callback(err);
									if(data.length == 0){
										message.user  = {accounts : [{
											id: "mailto:" + user.email,
											gateway: "mailto",
											params: ""
										}]}
										return callback(new Error("AUTH_UNREGISTERED"));	
									} 
									message.user = data[0];
									message.ref = message.user.id;
									message.user.accounts = [{
										id: "mailto:" + user.email,
										gateway: "mailto",
										params: ""
									}];
									callback();
								});
							}catch(e){
								return callback(e)
							}
						});
					}
			});
		}else{
			callback();
		}
	}, "authentication");
};



function handlerRequest(req, res, next) {
	var path = req.path.substring(12);
	path = path.split("/");
	if(path[0] == "login") {
		return res.render(__dirname+"/login.jade", {
			client_id: config.facebook.client_id, 
			redirect_uri: "https://"+config.http.host+"/r/facebook/return"
		});
	}
	if(path[0] == "return"){
		return res.render(__dirname+"/return.jade", {});	
	}
}