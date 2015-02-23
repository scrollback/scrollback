var log = require("../lib/logger.js");
var core, config;
module.exports = function(c, conf) {
	core = c;
	config = conf;
	
	return {
		init: init
	};
};


var init = function(app) {
	configInit();

	function configInit() {
		//memorize all variables.
		core.emit("http/init", [], function(err, payload) {
			if (err) {
				throw err;
			}
			log("payload: ", payload);
			payload.forEach(function(ap) {
				if (ap.get) {
					for (var g in ap.get) {
						if (ap.get.hasOwnProperty(g)) {
							app.get(g, ap.get[g]);
						}
					}
				}
				if (ap.post) {
					for (var a in ap.post) {
						if (ap.post.hasOwnProperty(a)) {
							app.post(a, ap.post[a]);
						}
					}
				}

			});
		});
	}
};
