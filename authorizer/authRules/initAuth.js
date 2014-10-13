module.exports = function(core) {
	core.on("init", function(action, next){
		var origin = action.origin, user = action.user, blacklist;
		if(!origin.verified) return next(new Error("BLACKLISTED_DOMAIN"));
		if(/^guest-/.test(user.id)) return next();
		blacklist = user.params && user.params["domain-blacklist"];
		if(!(blacklist instanceof Array) || blacklist.length) return next();
		
		if(blacklist.indexOf(origin.domain)>=0) return next(new Error("BLACKLISTED_DOMAIN"));
		next();
	}, "authorization");
};