var log = require("../lib/logger.js");
var configPlugins ;

exports.init = function(app, core) {
	
	/**Object structure for config
	 *config: {
		appname : {
			get: {
				"login": function() {},
				...
			}
			post: {
				....
			}
		},
		...
	}
	It will set "configPlugins"
	configPlugins: {
		get: {function}
		post: {function}
	}
	 */
	function configInit(callback) {
		//memorize all variables.
		core.emit("http/init", {}, function(err, payload) {
			if(err) {
				return;
			}
			configPlugins = {};
			configPlugins.get = {};
			configPlugins.post = {};
			var p = {};
			for(var ap in payload) {
				if (payload[ap]) {
					if (payload[ap].config) {
						p[ap] = payload[ap].config;
					}
					if (payload[ap].get && typeof payload[ap].get === "function") {
						configPlugins.get[ap] = payload[ap].get;
					}
					if (payload[ap].post && typeof payload[ap].post === "function") {
						configPlugins.post[ap] = payload[ap].post;
					}
				}
			}
			callback();
		});
	}
	
	app.get("/r/*" , function(req,res,next) {
		if (!configPlugins) {
			log("get req starting");
			configInit(function(){
				// log("get req com", configPlugins);
				exec(req.path, 'get', req, res, next);	
			});
		} else exec(req.path, 'get', req, res, next);	
	});
	function exec(url, r,req,res,next) {
		var s = url.split('/');
		if (s.length >= 3) {
			if (configPlugins && configPlugins[r] && configPlugins[r][s[2]]) {
				return configPlugins[r][s[2]](req,res,next);
			}
		}
		return next();
	}
	app.post("/r/*" , function(req,res,next) {
		if (!configPlugins) {
			configInit(function(){
				exec(req.path, 'post', req, res, next);		
			});
		} else exec(req.path, 'post', req, res, next);
	});
	
};