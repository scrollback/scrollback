/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {

	var session = types.session;
	
	return {
		put: function (session, cb) {
			
			cb();
		},
		
		get: function (options, cb) {
			cb();
		}
	};
};
