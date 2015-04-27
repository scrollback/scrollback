module.exports = function(core) {
	core.on("init",function(init, next) {
		if(init.auth && init.auth.testAuth) {
				core.emit("getUsers", {
				identity:init.auth.testAuth,
				session: "internal-test"
			}, function(err, data) {
				if (err || !data || !data.results) return next(err);
				init.user = data.results[0];
				next();
			});
		} else {
			next();	
		}
	}, "authentication");
};
