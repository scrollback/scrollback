/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

var config = require('./config.js');

if(config.core.newrelic.key) exports.config = {
	app_name : config.core.newrelic.name || "Scrollback",
	license_key : config.core.newrelic.key,
	logging : {
		level : 'info'
	},
	rules: {
		ignore: [
			'^/socket/\*',
		]
	}
};
