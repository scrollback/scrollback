/* eslint-env es6 */

"use strict";

const Validator = require("../../lib/validator.js");

module.exports = core => {
	return function(type, name, callback) {
		let validation = new Validator(name);

		if (!validation.isValid()) {
			return callback("error", type + " " + validation.getErrorString());
		}

		callback("wait");

		core.emit("getEntities", { ref: name }, function(err, res) {
			if (err) {
				return callback("error", "An error occured. May be try later?");
			}

			if (res && res.results && res.results.length) {
				return callback("error", name + " is not available. May be try another?");
			} else {
				return callback("ok", name);
			}
		});
	};
};
