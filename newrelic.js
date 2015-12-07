/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

var config = require('./server-config-defaults.js');

if(config.core.newrelic.key) {
		exports.config = {
			app_name : config.core.newrelic.name || "Scrollback",
			license_key : config.core.newrelic.key,
			logging : {
				level : 'info'
			},
			rules: {
				ignore: [
					'^/engine.io'
				],
				name: [
					{ pattern: "/me",   name: "/me"  },
					{ pattern: "/i/.*", name: "/i/*" },
					{ pattern: "/s/.*", name: "/s/*" },
					{ pattern: "/r/.*", name: "/r/*" },
					{ pattern: /^\/([\w\-]{3,32})\/.*/, name: "/:room/:discussion" },
					{ pattern: /^\/([\w\-]{3,32})$/, name: "/:room" }
				]
			}
		};
}

