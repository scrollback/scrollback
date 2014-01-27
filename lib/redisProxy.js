var redis = require("redis");
var generic_pool = require("generic-pool").Pool({
	name: "redis pool",
	max: 50,
	create: function(callback) {
		var x = redis.createClient();
		callback(null, x);
	},
	destroy: function(redisClient) {
		redisClient.quit();
	}
});

module.exports = (function(){
	var prop;
	var dc = redis.createClient(), proxy = {};
	for(prop in dc) {	
		(function(prop){
			proxy[prop] = function() {
				var args = [].splice.call(arguments,0);
				generic_pool.acquire(function(err, client) {
					var cb = typeof args[args.length-1] === 'function'? args.pop(): null;
					args.push(function() {
						generic_pool.release(client);
						if(cb) cb.apply(null, arguments);
					});
					client[prop].apply(client, args)
				});
			}
		})(prop);
	}
	dc.quit();
	return proxy;
})();