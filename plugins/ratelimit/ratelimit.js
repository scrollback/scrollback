var users={};


module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		var limiter;
		if (!users[message.from])
			users[message.from]=new RateLimiter(config.http.limit, config.http.time);
		limiter = users[message.from];
		
		if (message.type=="nick") {
			if (users[message.from]) {
				users[message.ref] = users[message.from];
				// this statement means that the auth plugin has to be called before this plugin.
				// make be even ignore this when the its a auth request.
				delete users[message.from];
			}
		}
		
		limiter.removeTokens(1, function(err, remaining) {
			var room;
			if (remaining < 0) {
				log("Error: API Limit exceeded.");
				callback(new Error("API Limit exceeded"));
			}
			callback();
		});
	});
};

RateLimiter =function(a,b,c){
	return {
		limit:a,
		time:b,
		removeTokens: function(count,callback){
			if(this.limit>0){
				this.limit-=count;
				setTimeout(function(object,count){
					object.limit+=count;
				},this.time,this,count);
			}
			callback(null, this.limit);
		}
    };
};