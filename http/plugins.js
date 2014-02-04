var log = require("../lib/logger.js");
var configPlugins ;
var core ;

exports.init = function(app, coreObject) {
	core = coreObject;
	app.get("/s/editRoom" ,function(req, res) {
		if (!configPlugins) {
			configInit(function() {
				res.render("newConfig", configPlugins);
			});
		}
		else res.render("newConfig", configPlugins);
		
	});
	app.get("/s/script.js", function(req, res) {
		if (!configPlugins) {
			configInit(function(){
				res.end(configPlugins.scripts);		
			});
		}
		else res.end(configPlugins.scripts);
		
	});
	app.get("/r/*" , function(req,res,next) {
		if (!configPlugins) {
			log("get req starting");
			configInit(function(){
				log("get req com", configPlugins);
				exec(req.path, 'get', req, res, next);	
			});
		}
		else exec(req.path, 'get', req, res, next);	
	});
	function exec(url, r,req,res,next) {
		var s = url.split('/');
		log("s=", s);
		if (s.length === 4) {
			if (configPlugins && configPlugins[r] && configPlugins[r][s[2]] && configPlugins[r][s[2]][s[3]]) {
				return configPlugins[r][s[2]][s[3]](req,res,next);
			}
		}
		return next();
	}
	app.post("/r/*" , function(req,res,next) {
		if (!configPlugins) {
			configInit(function(){
				exec(req.path, 'post', req, res, next);		
			});
		}
		else exec(req.path, 'post', req, res, next);
	});
	/**Object structure for config
	 *config: {
		appname : {
			config: {string}//config html
			script: {function},
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
		pluginUI:{object},
		scripts: {string},
		get: {object}
		post: {object}
	}
	 */
	function configInit(callback) {
		//memorize all variables.
		core.emit("http/init", {}, function(err, payload) {
			if(err) {
				return;
			}
			configPlugins = {};
			configPlugins.pluginsUI = {};
			configPlugins.scripts = "";
			configPlugins.get = {};
			configPlugins.post = {};
			var p = {};
			for(var ap in payload) {
				if (payload[ap]) {
					if (payload[ap].config) {
						p[ap] = payload[ap].config;
					}
					if (payload[ap].script) {
						configPlugins.scripts += ap + ": " + payload[ap].script + ","; 
					}
					if (payload[ap].get) {
						configPlugins.get[ap] = payload[ap].get;
					}
					if (payload[ap].post) {
						configPlugins.post[ap] = payload[ap].post;
					}
				}
			}
			configPlugins.scripts = "var scripts = {"  + (configPlugins.scripts.substring(0, configPlugins.scripts.length-1)) + "}";
			configPlugins.pluginsUI = p;
			callback();
		});
	}
};