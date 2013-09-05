		var limiter = new RateLimiter(config.http.limit, config.http.time, true);
			limiter.removeTokens(1, function(err, remaining) {
				var room;
				
				if (remaining < 0) {
					log("Error: API Limit exceeded.");
					socket.emit('error', 'API Limit exceeded.');
					return;
				}
				log("API Limit remaining:", remaining);
				
