/* jshint browser: true */

"use strict";

var validate = require("../../lib/validate.js");

module.exports = function(core) {
	function validateEntity(type, name, callback) {
		var validation;

		if (typeof callback !== "function") {
			return;
		}

		name = (typeof name === "string") ? name.toLowerCase().trim() : "";

		validation = validate(name);

		if (!validation.isValid) {
			return callback("error", type + " " + validation.error);
		}

		callback("wait");

		core.emit("getEntities", {
			ref: name
		}, function(err, res) {
			if (res && res.results && res.results.length) {
				return callback("error", name + " is not available. May be try another?");
			} else {
				return callback("ok", name);
			}
		});
	}

	return validateEntity;
};
