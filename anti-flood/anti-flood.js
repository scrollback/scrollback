var log = require("../lib/logger.js");
var users={};
var config = require('../config.js');

module.exports = function(core) {
	core.on('message', function(message, callback) {
		var limiter;
		log("Heard \"message\" event");
		if (!users[message.from])
			users[message.from]=new RateLimiter(config.http.limit, config.http.time);
		limiter = users[message.from];

		if (message.origin && message.origin.gateway == "irc") return callback();

		if (message.type=="back" || message.type=="away" ) {
			return callback();
		}
		if (message.type=="nick") {// this should probably not be here...
			if (users[message.from]) {
				users[message.ref] = users[message.from];
				// this statement means that the auth plugin has to be called before this plugin.
				// make be even ignore this when the its a auth request.
				delete users[message.from];
			}
			return callback();
		}

		limiter.removeTokens(1, function(err, remaining) {
			var room;
			if (remaining < 0) {
				return callback(new Error("API Limit exceeded"));
			}
			return callback();
		});
	}, "antiabuse");
};

RateLimiter =function(a,b,c){
	return {
		limit:a,
		time:b,
		removeTokens: function(count,callback){
			if(this.limit>=0){
				this.limit-=count;
				setTimeout(function(object,count){
					object.limit+=count;
				},this.time,this,count);
			}
			callback(null, this.limit);
		}
    };
};
