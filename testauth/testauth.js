var crypto = require('crypto'),
	log = require('../lib/logger.js');

module.exports = function(core) {
	core.on("init", function(init, next) {
		if (init.auth && init.auth.testauth) {
			core.emit("getUsers", {
				ref: init.auth.testauth,
				session: "internal-test"
			}, function(err, data) {
				var gravatar;
				if (err || !data) return next(err);
				if (!data.results.length) {
					init.old = {};
					init.user = {};
					init.user.id = init.old.id;
					init.user.identities = [init.auth.testauth];
					init.user.picture = gravatar = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(init.auth.testauth.substring(7)).digest('hex') + '/?d=retro';

					init.user.params = {
						pictures: [gravatar]
					};
					log.d("AUTH:UNREGISTERED");
					init.response = new Error("AUTH:UNREGISTERED");
					return next();
				}

				log.d("AUTH:UNREGISTERED");
				init.user = data.results[0];
				next();
			});
		} else {
			next();
		}
	}, "authentication");
};
